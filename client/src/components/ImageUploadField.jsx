import { useState, useRef } from 'react';
import { fileToOptimizedDataUrl } from '../api.js';

export default function ImageUploadField({
  label = 'Upload Image',
  value = '',
  onChange,
  placeholder = 'No image selected',
  helpText = 'Select an image from your device (JPG, PNG, WebP)',
  previewHeight = 150,
  showUrlFallback = true
}) {
  const [loading, setLoading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const dataUrl = await fileToOptimizedDataUrl(file);
      if (onChange) onChange(dataUrl);
    } catch (err) {
      alert(err.message || 'Failed to process image file.');
    } finally {
      setLoading(false);
      // Reset input so same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearImage = () => {
    if (onChange) onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="image-uploader-component">
      {label && <label className="image-uploader-label">{label}</label>}

      <div className="image-uploader-body">
        {/* Preview Thumbnail Box */}
        <div
          className="image-uploader-preview"
          style={{ height: previewHeight }}
        >
          {value ? (
            <>
              <img
                src={value}
                alt="Selected preview"
                className="image-uploader-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <button
                type="button"
                className="image-clear-btn"
                title="Remove image"
                onClick={clearImage}
              >
                ✕ Remove
              </button>
            </>
          ) : (
            <div className="image-uploader-empty">
              <span className="empty-icon">🖼️</span>
              <span className="empty-text">{placeholder}</span>
            </div>
          )}

          {loading && (
            <div className="image-uploader-spinner">
              <span>Optimizing image...</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="image-uploader-controls">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className="image-choose-file-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            📁 {value ? 'Replace Image from Device' : 'Choose File from Device'}
          </button>

          {helpText && <span className="image-uploader-tip muted small">{helpText}</span>}

          {showUrlFallback && (
            <div className="image-url-toggle-wrap">
              <button
                type="button"
                className="link-inline-btn small"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                {showUrlInput ? 'Hide Web Link (URL) field' : 'Or paste web image URL ▾'}
              </button>

              {showUrlInput && (
                <input
                  type="url"
                  className="image-url-input"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={value && !value.startsWith('data:') ? value : ''}
                  onChange={(e) => onChange && onChange(e.target.value)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
