'use client';

import React, { useState } from 'react';

export default function PhotoDebugTest() {
  const [files, setFiles] = useState<File[]>([]);
  const [blobUrls, setBlobUrls] = useState<string[]>([]);
  const [base64Urls, setBase64Urls] = useState<string[]>([]);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setDiagnostics(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    setDiagnostics([]);
    
    addLog(`📁 ${selectedFiles.length} fichier(s) sélectionné(s)`);

    // Test 1: Blob URLs
    addLog('🧪 TEST 1: Création Blob URLs...');
    const blobs = selectedFiles.map((file, i) => {
      const url = URL.createObjectURL(file);
      addLog(`  ✓ Blob ${i + 1}: ${url.substring(0, 50)}...`);
      return url;
    });
    setBlobUrls(blobs);

    // Test 2: Base64
    addLog('🧪 TEST 2: Conversion Base64...');
    const base64s: string[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      try {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => {
            const result = e.target?.result as string;
            addLog(`  ✓ Base64 ${i + 1}: ${result.substring(0, 50)}... (${result.length} chars)`);
            resolve(result);
          };
          reader.onerror = (err) => {
            addLog(`  ✗ Erreur Base64 ${i + 1}: ${err}`);
            reject(err);
          };
          reader.readAsDataURL(file);
        });
        base64s.push(base64);
      } catch (error) {
        addLog(`  ✗ Erreur: ${error}`);
      }
    }
    setBase64Urls(base64s);
    
    addLog('✅ Tests terminés');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Diagnostic Photo Preview</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="mb-4 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {/* Diagnostics */}
        {diagnostics.length > 0 && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 mb-6 font-mono text-sm">
            <h3 className="text-white font-bold mb-2">📊 Logs:</h3>
            {diagnostics.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        )}

        {/* Test 1: Blob URLs */}
        {blobUrls.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Test 1: Blob URLs (URL.createObjectURL)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {blobUrls.map((url, i) => (
                <div key={i} className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <div className="aspect-square bg-white">
                    <img
                      src={url}
                      alt={`Blob ${i + 1}`}
                      className="w-full h-full object-cover"
                      onLoad={() => addLog(`🖼️ Image Blob ${i + 1} chargée`)}
                      onError={(e) => addLog(`❌ Erreur chargement Blob ${i + 1}`)}
                    />
                  </div>
                  <div className="p-2 bg-gray-100 text-xs">
                    <div className="font-semibold">Blob {i + 1}</div>
                    <div className="truncate">{url.substring(0, 30)}...</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test 2: Base64 */}
        {base64Urls.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Test 2: Base64 (FileReader)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {base64Urls.map((url, i) => (
                <div key={i} className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <div className="aspect-square bg-white">
                    <img
                      src={url}
                      alt={`Base64 ${i + 1}`}
                      className="w-full h-full object-cover"
                      onLoad={() => addLog(`🖼️ Image Base64 ${i + 1} chargée`)}
                      onError={(e) => addLog(`❌ Erreur chargement Base64 ${i + 1}`)}
                    />
                  </div>
                  <div className="p-2 bg-gray-100 text-xs">
                    <div className="font-semibold">Base64 {i + 1}</div>
                    <div className="truncate">{url.substring(0, 30)}...</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test 3: Styles inline forcés */}
        {base64Urls.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Test 3: Styles inline forcés</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {base64Urls.map((url, i) => (
                <div key={i} style={{
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: 'white'
                }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '100%',
                    background: 'white'
                  }}>
                    <img
                      src={url}
                      alt={`Inline ${i + 1}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onLoad={() => addLog(`🖼️ Image Inline ${i + 1} chargée`)}
                      onError={(e) => addLog(`❌ Erreur chargement Inline ${i + 1}`)}
                    />
                  </div>
                  <div style={{
                    padding: '8px',
                    background: '#f3f4f6',
                    fontSize: '12px'
                  }}>
                    <div style={{ fontWeight: 600 }}>Inline {i + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informations fichiers */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">📄 Informations fichiers</h2>
            <div className="space-y-2">
              {files.map((file, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded text-sm">
                  <div><strong>Fichier {i + 1}:</strong> {file.name}</div>
                  <div className="text-gray-600">
                    Type: {file.type} | Taille: {(file.size / 1024).toFixed(2)} KB | 
                    Modifié: {new Date(file.lastModified).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
