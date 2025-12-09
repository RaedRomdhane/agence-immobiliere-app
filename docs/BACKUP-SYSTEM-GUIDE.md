# 🔐 Automated Backup System - Complete Guide

**Date**: December 7, 2025  
**Status**: ✅ **COMPLETE**  
**Version**: 1.0.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## 🎯 Overview

Comprehensive automated backup solution with:
- **MongoDB database backups** every 6 hours
- **Media files backups** every 6 hours (offset)
- **Azure Blob Storage** cloud replication
- **Automated restoration** scripts
- **Health monitoring** and alerts
- **7-day local retention** with cloud archival

### Key Features

✅ **Automated Scheduling** - Cron-based with Kubernetes CronJob support  
✅ **Cloud Backup** - Azure Blob Storage integration  
✅ **Compression** - gzip compression for optimal storage  
✅ **Verification** - Post-backup integrity checks  
✅ **Alerting** - Slack/Webhook notifications  
✅ **Restoration** - One-command restore with safety confirmations  
✅ **Health Checks** - Daily monitoring with alerts  
✅ **Retention Policy** - Configurable local and cloud retention

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Backup System                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐       ┌──────────────┐                   │
│  │  MongoDB     │       │  Media Files │                   │
│  │  Backup      │       │  Backup      │                   │
│  │  (Every 6h)  │       │  (Every 6h)  │                   │
│  └──────┬───────┘       └──────┬───────┘                   │
│         │                      │                            │
│         └──────────┬───────────┘                            │
│                    │                                        │
│              ┌─────▼─────┐                                 │
│              │  Local    │                                 │
│              │  Storage  │                                 │
│              │  (7 days) │                                 │
│              └─────┬─────┘                                 │
│                    │                                        │
│              ┌─────▼─────┐                                 │
│              │  Azure    │                                 │
│              │  Blob     │                                 │
│              │  Storage  │                                 │
│              └───────────┘                                 │
│                    │                                        │
│              ┌─────▼─────┐                                 │
│              │  Health   │                                 │
│              │  Check    │                                 │
│              │  (Daily)  │                                 │
│              └─────┬─────┘                                 │
│                    │                                        │
│              ┌─────▼─────┐                                 │
│              │  Alerts   │                                 │
│              │  Slack /  │                                 │
│              │  Webhook  │                                 │
│              └───────────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

### Backup Schedule

| Type | Schedule | Offset | Retention |
|------|----------|--------|-----------|
| MongoDB | Every 6 hours | 0:00, 6:00, 12:00, 18:00 | 7 days local + cloud |
| Media | Every 6 hours | 1:00, 7:00, 13:00, 19:00 | 7 days local + cloud |
| Health Check | Daily | 8:00 AM | 7 days logs |

---

## 🚀 Quick Start

### 1. Docker Environment (Development)

```bash
# 1. Set environment variables
export MONGODB_URI="mongodb://mongodb:27017"
export BACKUP_DIR="/app/backups"
export AZURE_STORAGE_ACCOUNT="your_storage_account"
export AZURE_STORAGE_KEY="your_storage_key"

# 2. Make scripts executable
chmod +x backend/scripts/backup/*.sh

# 3. Run manual backup
./backend/scripts/backup/backup-mongodb.sh
./backend/scripts/backup/backup-media.sh

# 4. Verify backups
ls -lh /app/backups/mongodb/
ls -lh /app/backups/media/
```

### 2. Kubernetes (Production)

```bash
# 1. Create namespace
kubectl create namespace production

# 2. Create Azure Storage secret
kubectl create secret generic azure-storage \
  --namespace=production \
  --from-literal=account-name='your_account' \
  --from-literal=account-key='your_key'

# 3. Create MongoDB credentials secret
kubectl create secret generic mongodb-credentials \
  --namespace=production \
  --from-literal=uri='mongodb://user:pass@mongodb:27017'

# 4. Create notification webhook secret (optional)
kubectl create secret generic notification-webhooks \
  --namespace=production \
  --from-literal=slack-webhook='https://hooks.slack.com/...'

# 5. Deploy CronJobs
kubectl apply -f infrastructure/k8s/backup-cronjobs.yaml

# 6. Verify CronJobs
kubectl get cronjobs -n production
```

---

## ⚙️ Configuration

### Environment Variables

#### MongoDB Backup

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://mongodb:27017` | MongoDB connection string |
| `MONGODB_DATABASE` | `agence-immobiliere` | Database name to backup |
| `BACKUP_DIR` | `/app/backups/mongodb` | Local backup directory |
| `LOCAL_RETENTION_DAYS` | `7` | Days to keep local backups |
| `AZURE_STORAGE_ACCOUNT` | - | Azure storage account name |
| `AZURE_STORAGE_KEY` | - | Azure storage account key |
| `AZURE_CONTAINER` | `backups` | Azure blob container name |
| `WEBHOOK_URL` | - | Notification webhook URL |

#### Media Backup

| Variable | Default | Description |
|----------|---------|-------------|
| `MEDIA_DIR` | `/app/uploads` | Media files directory |
| `BACKUP_DIR` | `/app/backups/media` | Local backup directory |
| `LOCAL_RETENTION_DAYS` | `7` | Days to keep local backups |
| `AZURE_STORAGE_ACCOUNT` | - | Azure storage account name |
| `AZURE_STORAGE_KEY` | - | Azure storage account key |
| `AZURE_CONTAINER` | `backups` | Azure blob container name |
| `WEBHOOK_URL` | - | Notification webhook URL |

#### Health Check

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKUP_DIR` | `/app/backups` | Backup root directory |
| `MAX_AGE_HOURS` | `8` | Maximum backup age before alert |
| `MIN_BACKUPS` | `2` | Minimum backups required |
| `WEBHOOK_URL` | - | Notification webhook URL |
| `SLACK_WEBHOOK` | - | Slack webhook URL |
| `EMAIL_TO` | - | Alert email address |

### Azure Blob Storage Setup

```bash
# 1. Create storage account (if not exists)
az storage account create \
  --name agenceimmobilierebackups \
  --resource-group agence-immobiliere-prod \
  --location eastus \
  --sku Standard_GRS

# 2. Get storage key
az storage account keys list \
  --account-name agenceimmobilierebackups \
  --query '[0].value' -o tsv

# 3. Create container
az storage container create \
  --account-name agenceimmobilierebackups \
  --name backups \
  --auth-mode key

# 4. Set lifecycle policy (optional - auto-delete after 90 days)
az storage account management-policy create \
  --account-name agenceimmobilierebackups \
  --policy @lifecycle-policy.json
```

**lifecycle-policy.json**:
```json
{
  "rules": [
    {
      "enabled": true,
      "name": "delete-old-backups",
      "type": "Lifecycle",
      "definition": {
        "actions": {
          "baseBlob": {
            "delete": {
              "daysAfterModificationGreaterThan": 90
            }
          }
        },
        "filters": {
          "blobTypes": ["blockBlob"],
          "prefixMatch": ["backups/"]
        }
      }
    }
  ]
}
```

---

## 💻 Usage

### Manual Backup

#### MongoDB
```bash
# Basic backup
./backend/scripts/backup/backup-mongodb.sh

# With custom settings
MONGODB_URI="mongodb://user:pass@host:27017" \
BACKUP_DIR="/custom/path" \
./backend/scripts/backup/backup-mongodb.sh

# Check logs
tail -f /app/backups/mongodb/backup.log
```

#### Media Files
```bash
# Basic backup
./backend/scripts/backup/backup-media.sh

# With custom settings
MEDIA_DIR="/app/uploads" \
BACKUP_DIR="/custom/path" \
./backend/scripts/backup/backup-media.sh

# Check logs
tail -f /app/backups/media/backup.log
```

### Restore from Backup

#### MongoDB Restore
```bash
# List available backups
ls -lh /app/backups/mongodb/mongodb_*.tar.gz

# Restore from specific backup
./backend/scripts/backup/restore-mongodb.sh mongodb_agence-immobiliere_20251207_140000.tar.gz

# Restore latest backup
LATEST=$(ls -t /app/backups/mongodb/mongodb_*.tar.gz | head -1)
./backend/scripts/backup/restore-mongodb.sh "$LATEST"
```

⚠️ **Warning**: Restoration replaces the current database! A pre-restore backup is automatically created.

#### Media Restore
```bash
# List available backups
ls -lh /app/backups/media/media_*.tar.gz

# Restore from specific backup
./backend/scripts/backup/restore-media.sh media_20251207_140000.tar.gz

# Restore latest backup
LATEST=$(ls -t /app/backups/media/media_*.tar.gz | head -1)
./backend/scripts/backup/restore-media.sh "$LATEST"
```

### Download from Azure

```bash
# List available backups
az storage blob list \
  --account-name agenceimmobilierebackups \
  --container-name backups \
  --prefix mongodb/ \
  --output table

# Download specific backup
az storage blob download \
  --account-name agenceimmobilierebackups \
  --container-name backups \
  --name mongodb/mongodb_agence-immobiliere_20251207_140000.tar.gz \
  --file ./mongodb_backup.tar.gz

# Download and restore
az storage blob download \
  --account-name agenceimmobilierebackups \
  --container-name backups \
  --name mongodb/mongodb_agence-immobiliere_20251207_140000.tar.gz \
  --file /tmp/backup.tar.gz && \
./backend/scripts/backup/restore-mongodb.sh /tmp/backup.tar.gz
```

---

## 📊 Monitoring

### Health Check Dashboard

Run manual health check:
```bash
./backend/scripts/backup/backup-health-check.sh
```

Check last health report:
```bash
cat /app/backups/health-check-report.json | jq .
```

### Backup Status

```bash
# Check latest MongoDB backup
cat /app/backups/mongodb/latest_backup.json | jq .

# Check latest media backup
cat /app/backups/media/latest_backup.json | jq .

# List all backups with sizes
du -sh /app/backups/*/*.tar.gz | sort -h
```

### Kubernetes Monitoring

```bash
# List CronJobs
kubectl get cronjobs -n production

# Check CronJob status
kubectl describe cronjob mongodb-backup -n production

# View recent jobs
kubectl get jobs -n production --sort-by=.status.startTime

# Check job logs
kubectl logs -n production job/mongodb-backup-28412540 -f

# Check failed jobs
kubectl get jobs -n production --field-selector status.successful=0
```

### Metrics & Alerts

The health check script monitors:
- ✅ Backup age (alerts if > 8 hours old)
- ✅ Backup count (alerts if < 2 backups)
- ✅ Backup size (warns if suspiciously small)
- ✅ Disk space (alerts if > 90% used)
- ✅ Azure connectivity (warns if unreachable)

**Alert Levels**:
- 🚨 **CRITICAL**: No backups / Too old / Disk full
- ⚠️ **WARNING**: Few backups / High disk usage / Small backup size
- ✅ **HEALTHY**: All checks passed

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "mongodump not found"
**Solution**: Install MongoDB Database Tools
```bash
# Alpine Linux
apk add mongodb-tools

# Ubuntu/Debian
apt-get install mongodb-database-tools

# Docker image
FROM mongo:7.0  # Already includes mongodump
```

#### 2. "Azure upload failed"
**Causes**:
- Invalid credentials
- Network issues
- Container doesn't exist

**Solution**:
```bash
# Verify credentials
az storage account show \
  --name $AZURE_STORAGE_ACCOUNT

# Test connectivity
az storage container exists \
  --account-name $AZURE_STORAGE_ACCOUNT \
  --name $AZURE_CONTAINER
```

#### 3. "Permission denied" on backup directory
**Solution**:
```bash
# Fix permissions
chmod -R 755 /app/backups
chown -R nodejs:nodejs /app/backups

# In Dockerfile
RUN mkdir -p /app/backups && \
    chown -R nodejs:nodejs /app/backups
```

#### 4. "Disk space full"
**Solution**:
```bash
# Check disk usage
df -h /app/backups

# Manual cleanup
find /app/backups -name "*.tar.gz" -mtime +7 -delete

# Reduce retention
export LOCAL_RETENTION_DAYS=3
```

#### 5. Backup taking too long
**Optimizations**:
```bash
# Use parallel compression
tar -I pigz -cf backup.tar.gz /data

# Exclude large temp files
tar --exclude='*.log' --exclude='tmp/*' -czf backup.tar.gz /data

# Increase MongoDB timeout
mongodump --uri="$MONGODB_URI" --oplogReplay --socketTimeoutMS=300000
```

### Debug Mode

Run scripts with debug output:
```bash
# Enable bash debug mode
bash -x ./backend/scripts/backup/backup-mongodb.sh

# Verbose logging
export DEBUG=1
./backend/scripts/backup/backup-mongodb.sh
```

### Check Logs

```bash
# Backup logs
tail -f /app/backups/mongodb/backup.log
tail -f /app/backups/media/backup.log

# Cron logs
tail -f /app/backups/mongodb/cron.log
tail -f /app/backups/media/cron.log

# Health check logs
tail -f /app/backups/health-check.log

# Kubernetes logs
kubectl logs -n production -l app=mongodb-backup --tail=100 -f
```

---

## ❓ FAQ

### Q: How long are backups retained?
**A**: 7 days locally by default. Cloud backups can be retained longer (e.g., 90 days with Azure lifecycle policy).

### Q: What's the backup size?
**A**: Varies by data:
- MongoDB: Typically 10-500 MB (compressed)
- Media: Varies based on uploads (can be several GB)

### Q: Can I run backups more frequently?
**A**: Yes, edit the cron schedule:
```bash
# Every 3 hours instead of 6
0 */3 * * * /app/scripts/backup/backup-mongodb.sh
```

### Q: How do I test restore without affecting production?
**A**: 
1. Restore to a different database:
```bash
export MONGODB_DATABASE="agence-immobiliere-test"
./backend/scripts/backup/restore-mongodb.sh backup.tar.gz
```

2. Or use a separate MongoDB instance:
```bash
export MONGODB_URI="mongodb://test-server:27017"
./backend/scripts/backup/restore-mongodb.sh backup.tar.gz
```

### Q: What happens if backup fails?
**A**: 
- Script exits with error code
- Partial backup is cleaned up
- Alert sent to configured webhook
- Failed job retained in Kubernetes for debugging

### Q: Can I backup to multiple cloud providers?
**A**: Yes, modify the scripts to add S3, Google Cloud Storage, etc.:
```bash
# Add to backup-mongodb.sh
aws s3 cp "$ARCHIVE_PATH" "s3://my-bucket/backups/mongodb/"
```

### Q: How do I migrate backups between environments?
**A**:
```bash
# Download from prod Azure
az storage blob download \
  --account-name prod-storage \
  --container-name backups \
  --name mongodb/backup.tar.gz \
  --file backup.tar.gz

# Upload to staging Azure
az storage blob upload \
  --account-name staging-storage \
  --container-name backups \
  --name mongodb/backup.tar.gz \
  --file backup.tar.gz
```

---

## 📁 File Structure

```
backend/scripts/backup/
├── backup-mongodb.sh           # MongoDB backup script
├── backup-media.sh             # Media files backup script
├── restore-mongodb.sh          # MongoDB restore script
├── restore-media.sh            # Media restore script
├── backup-health-check.sh      # Health monitoring script
├── crontab.txt                 # Cron configuration
└── README.md                   # This file

infrastructure/k8s/
└── backup-cronjobs.yaml        # Kubernetes CronJob definitions

/app/backups/                   # Backup storage
├── mongodb/
│   ├── mongodb_*.tar.gz        # Compressed backups
│   ├── backup.log              # Backup logs
│   ├── cron.log                # Cron execution logs
│   └── latest_backup.json      # Last backup metadata
├── media/
│   ├── media_*.tar.gz
│   ├── backup.log
│   ├── cron.log
│   └── latest_backup.json
└── health-check-report.json   # Health check results
```

---

## ✅ Checklist

### Initial Setup
- [ ] Azure Storage account created
- [ ] Kubernetes secrets configured
- [ ] Backup scripts deployed
- [ ] CronJobs scheduled
- [ ] Notification webhooks configured
- [ ] Test backup successful
- [ ] Test restore successful

### Regular Maintenance
- [ ] Weekly: Review health check reports
- [ ] Monthly: Test restore procedure
- [ ] Quarterly: Verify Azure storage costs
- [ ] Annually: Review and update retention policies

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review logs in `/app/backups/`
3. Check Kubernetes events: `kubectl get events -n production`
4. Contact DevOps team

---

**Last Updated**: December 7, 2025  
**Maintainer**: DevOps Team  
**Status**: ✅ Production Ready
