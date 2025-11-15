# Creating GitHub Environments - Visual Guide

## 🎯 You Are Here: Environments Page

You should see a page that says "Environments" at the top with a "New environment" button on the right.

---

## Step 1: Click "New environment" Button

**What to click:**
```
┌─────────────────────────────────────────────────┐
│ Environments              [New environment]     │  ← Click this button!
└─────────────────────────────────────────────────┘
```

---

## Step 2: Create First Environment

**You'll see a popup or new page with:**

```
┌─────────────────────────────────────────────────┐
│ Name                                            │
│ ┌─────────────────────────────────────────────┐ │
│ │ production                                   │ │  ← Type exactly: production
│ └─────────────────────────────────────────────┘ │
│                                                 │
│           [Configure environment]               │  ← Click this
└─────────────────────────────────────────────────┘
```

**IMPORTANT:** Type exactly `production` (lowercase, no capital P)

---

## Step 3: Configure "production" Environment

You'll now see the configuration page. Scroll down and configure:

### A) Environment Protection Rules

**✅ Check "Required reviewers"**
```
☑ Required reviewers
  
  Add up to 6 people or teams
  [Add reviewers]  ← Click to add yourself and 1 teammate
```

**✅ Check "Wait timer"**
```
☑ Wait timer

  Wait [5] minutes before allowing deployments to proceed
```

**✅ Configure "Deployment branches"**
```
Deployment branches

● All branches
○ Protected branches only  
○ Selected branches   ← Select this option!

  Branch name pattern
  ┌─────────────────────────────────────────────┐
  │ main                                         │  ← Type: main
  └─────────────────────────────────────────────┘
  [Add rule]  ← Click this
```

### Settings Auto-Save!
No need to click "Save" - your changes are automatically saved.

---

## Step 4: Create Second Environment

**Go back to Environments page:**
- Click "Environments" in the left sidebar
- OR click the back arrow

**Click "New environment" again**

**Type name:**
```
┌─────────────────────────────────────────────────┐
│ Name                                            │
│ ┌─────────────────────────────────────────────┐ │
│ │ production-rollback                          │ │  ← Type exactly this
│ └─────────────────────────────────────────────┘ │
│                                                 │
│           [Configure environment]               │  ← Click this
└─────────────────────────────────────────────────┘
```

**IMPORTANT:** Type exactly `production-rollback` (lowercase, with hyphen)

---

## Step 5: Configure "production-rollback" Environment

### A) Environment Protection Rules

**✅ Check "Required reviewers"**
```
☑ Required reviewers
  
  [Add reviewers]  ← Add same people as before
```

**✅ Check "Wait timer" - DIFFERENT VALUE!**
```
☑ Wait timer

  Wait [0] minutes before allowing deployments to proceed
```
⚠️ **CRITICAL:** Set to **0 minutes** for fast emergency rollbacks!

**✅ Configure "Deployment branches" - DIFFERENT SETTING!**
```
Deployment branches

● All branches  ← Select this option!
○ Protected branches only  
○ Selected branches
```
⚠️ **IMPORTANT:** Select "All branches" (not "Selected branches")

This allows rollback to any tag/branch.

---

## ✅ Verification

**Go back to Environments page**

You should now see (among your other environments):

```
┌─────────────────────────────────────────────────┐
│ Environments              [New environment]     │
├─────────────────────────────────────────────────┤
│                                                 │
│ ... (your existing environments)                │
│                                                 │
│ production                    3 protection rules│  ← NEW!
│                                                 │
│ production-rollback          2 protection rules│  ← NEW!
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Quick Comparison

| Setting | production | production-rollback |
|---------|-----------|---------------------|
| **Name** | `production` | `production-rollback` |
| **Reviewers** | 2+ people | Same 2+ people |
| **Wait Timer** | **5 minutes** | **0 minutes** ⚡ |
| **Branches** | **main only** | **All branches** |
| **Purpose** | Regular deployments | Emergency rollback |

---

## 🆘 Troubleshooting

### "I don't see the New environment button"

**Solution:** You need admin access to the repository
- Ask the repository owner to give you admin access
- Or share your screen and they can do it

### "The environment already exists"

**Solution:** 
- Check if there's already an environment with similar name
- Make sure you're typing exactly: `production` (lowercase)
- Don't use "Production" (capital P) - it's different!

### "I can't add reviewers"

**Solution:**
- Make sure the people you're adding have at least "Write" access
- Go to Settings → Collaborators to add them first
- Then come back and add them as reviewers

### "I don't see Deployment branches option"

**Solution:**
- Scroll down on the environment configuration page
- It's usually at the bottom of the protection rules section

---

## ✅ After Configuration

Once both environments are created:

1. ✅ You should see both in the list
2. ✅ Each should show "protection rules" count
3. ✅ Click on each to verify settings match the table above

**Next:** Add the 10 secrets (see the main guide!)

---

**Current Step:** Creating environments  
**Next Step:** Adding secrets  
**Estimated Time Remaining:** 10 minutes

Need help? Take a screenshot and share it!
