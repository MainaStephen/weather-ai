import React, { useState, useRef } from 'react';
import { CloudUpload, Leaf, Trees, Activity, ClipboardList, Lightbulb, X, User, MapPin, Ruler, FileText } from 'lucide-react';
import { useForestAnalysis } from '../hooks/useForestAnalysis';

export const ForestAnalyzer = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [metadata, setMetadata] = useState({
    farmerId: '',
    county: '',
    landAcres: '',
    location: '',
    notes: '',
  });
  
  const fileInputRef = useRef(null);
  const { data, loading, error, analyzeImage, reset } = useForestAnalysis();

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('File too large. Maximum size is 20MB.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return;

    await analyzeImage(imageFile, {
      farmerId: metadata.farmerId || undefined,
      county: metadata.county || undefined,
      landAcres: metadata.landAcres ? parseFloat(metadata.landAcres) : undefined,
      location: metadata.location || undefined,
      notes: metadata.notes || undefined,
    });
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setMetadata({ farmerId: '', county: '', landAcres: '', location: '', notes: '' });
    reset();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-white mb-2">
        <Trees size={24} className="inline mr-2 text-emerald-400" />
        AI Tree Crown Analysis
      </h3>
      <p className="text-slate-300 mb-6">
        Upload drone, aerial, or satellite imagery — AI will count trees, assess canopy health, 
        and provide Gemini-powered agronomic recommendations.
      </p>

      {!data && !loading && (
        <form onSubmit={handleSubmit} className="flex-col" style={{ gap: '1rem', display: 'flex' }}>
          <div
            className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-emerald-500 transition cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUpload size={48} className="text-slate-400 mx-auto mb-2" />
            <p className="text-slate-300">Click to upload farm image (JPEG, PNG, WEBP, max 20MB)</p>
            <p className="text-slate-500 text-sm mt-1">Drone, aerial, or satellite imagery recommended</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg mx-auto" />
              <button
                type="button"
                onClick={handleReset}
                className="absolute right-2 top-2 bg-red-600 p-1 rounded-full hover:bg-red-700"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="grid-2">
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Farmer ID (optional)"
                value={metadata.farmerId}
                onChange={(e) => setMetadata({ ...metadata, farmerId: e.target.value })}
                className="input pl-10"
              />
            </div>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="County / Region (optional)"
                value={metadata.county}
                onChange={(e) => setMetadata({ ...metadata, county: e.target.value })}
                className="input pl-10"
              />
            </div>
            <div className="relative">
              <Ruler size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="number"
                step="0.1"
                placeholder="Land area (acres)"
                value={metadata.landAcres}
                onChange={(e) => setMetadata({ ...metadata, landAcres: e.target.value })}
                className="input pl-10"
              />
            </div>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Farm name or GPS (optional)"
                value={metadata.location}
                onChange={(e) => setMetadata({ ...metadata, location: e.target.value })}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="relative">
            <FileText size={16} className="absolute left-3 top-3 text-slate-400" />
            <textarea
              rows={2}
              placeholder="Additional context (e.g., Tea plantation, recently pruned)"
              value={metadata.notes}
              onChange={(e) => setMetadata({ ...metadata, notes: e.target.value })}
              className="input pl-10 pt-2"
            />
          </div>

          <button type="submit" className="btn-success py-3" disabled={!imageFile}>
            <Leaf size={16} className="inline mr-2" />
            Analyze Trees
          </button>
        </form>
      )}

      {loading && (
        <div className="text-center py-12">
          <Activity size={48} className="animate-spin text-emerald-400 mx-auto mb-3" />
          <p className="text-slate-300">Analyzing image with OpenCV + Gemini AI...</p>
          <p className="text-slate-500 text-sm mt-2">This may take 10-20 seconds</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button onClick={handleReset} className="btn-primary mt-3">Try Again</button>
        </div>
      )}

      {data && !loading && (
        <div className="flex-col" style={{ gap: '1rem', display: 'flex', marginTop: '1rem' }}>
          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="grid-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm">Total Trees</p>
                <p className="text-3xl font-bold text-emerald-400">{data.total_tree_count}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">Density (per acre)</p>
                <p className="text-3xl font-bold text-blue-400">
                  {data.tree_density_per_acre?.toFixed(1) || (data.total_tree_count / (data.land_acres || 1)).toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">Canopy Coverage</p>
                <p className="text-3xl font-bold text-green-400">{data.canopy_coverage_pct}%</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">Confidence</p>
                <p className="text-3xl font-bold text-purple-400">{Math.round(data.confidence_score * 100)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Activity size={16} /> Tree Health Breakdown
            </h4>
            <div className="flex-col" style={{ gap: '0.5rem', display: 'flex' }}>
              <div className="flex-between">
                <span>🌳 Healthy:</span>
                <span className="font-semibold text-green-400">{data.tree_health.healthy}</span>
              </div>
              <div className="flex-between">
                <span>⚠️ Needs care:</span>
                <span className="font-semibold text-yellow-400">{data.tree_health.needs_care}</span>
              </div>
              <div className="flex-between">
                <span>❌ Needs replacement:</span>
                <span className="font-semibold text-red-400">{data.tree_health.needs_replacement}</span>
              </div>
            </div>
          </div>

          {data.observations.length > 0 && (
            <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700/50">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <ClipboardList size={16} /> AI Observations
              </h4>
              <ul className="list-disc list-inside text-slate-200">
                {data.observations.map((obs, i) => (
                  <li key={i}>{obs}</li>
                ))}
              </ul>
            </div>
          )}

          {data.recommendations.length > 0 && (
            <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-700/50">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Lightbulb size={16} /> Recommendations
              </h4>
              <ul className="list-disc list-inside text-slate-200">
                {data.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {data.overlay_image_url && (
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Annotated Overlay Image:</p>
              <img src={data.overlay_image_url} alt="Overlay" className="max-w-full rounded-lg mx-auto border border-slate-600" />
            </div>
          )}

          <button onClick={handleReset} className="btn-primary w-full mt-4">
            Analyze Another Image
          </button>
        </div>
      )}
    </div>
  );
};