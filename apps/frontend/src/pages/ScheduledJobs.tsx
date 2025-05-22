import React, { useState, useEffect } from 'react';
import { getTemplates } from '../services';
import { ExtractedDataDisplay } from '../components/ExtractedDataDisplay';

const Tracker: React.FC = () => {
  const squares = Array.from({ length: 6 });
  const [showModal, setShowModal] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState<number | null>(null);

  // Store which template is selected for each box
  const [boxTemplates, setBoxTemplates] = useState<(any | null)[]>(Array(6).fill(null));

  // Fetch templates with pagination
  useEffect(() => {
    if (showModal) {
      setLoading(true);
      getTemplates(page, 6)
        .then((res) => {
          setTemplates(res.templates);
          setTotalPages(res.totalPages || 1);
        })
        .finally(() => setLoading(false));
    }
  }, [showModal, page]);

  const handleBoxClick = (idx: number) => {
    setSelectedBox(idx);
    setShowModal(true);
    setPage(1); // Reset to first page when opening modal
    setSelectedTemplateIdx(null);
  };

  // When a template is clicked in the modal, assign it to the selected box
  const handleTemplateSelect = (tpl: any) => {
    if (selectedBox !== null) {
      setBoxTemplates((prev) => {
        const updated = [...prev];
        updated[selectedBox] = tpl;
        return updated;
      });
    }
    setShowModal(false);
    setSelectedBox(null);
    setSelectedTemplateIdx(null);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedBox(null);
    setSelectedTemplateIdx(null);
  };

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div
      style={{
        minHeight: '55vh',
        width: '80vw',
        margin: '0 auto',
        padding: 0,
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '24px',
          width: '75%',
          height: '100%',
        }}
      >
        {squares.map((_, idx) => (
          <div
            key={idx}
            style={{
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '3rem',
              color: '#888',
              width: '100%',
              aspectRatio: '1 / 1',
              boxSizing: 'border-box',
              transition: 'box-shadow 0.2s',
              overflow: 'hidden',
            }}
            title="Add new job"
            onClick={() => handleBoxClick(idx)}
          >
            {boxTemplates[idx] ? (
              <ExtractedDataDisplay
                extractedData={(() => {
                  try {
                    return JSON.parse(boxTemplates[idx].content);
                  } catch {
                    return [];
                  }
                })()}
                presentationSuggestions={[
                  {
                    template_type: boxTemplates[idx].type || 'TABLE',
                    description: boxTemplates[idx].description || '',
                    suitability_reason: boxTemplates[idx].suitability_reason || '',
                  },
                ]}
                jobId={boxTemplates[idx].analyserJobId}
              />
            ) : (
              <span style={{ fontSize: '3rem', lineHeight: 1 }}>+</span>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={handleClose}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 32,
              minWidth: 300,
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
              position: 'relative',
              maxWidth: 600,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Choose a template</h2>
            {loading ? (
              <div>Loading templates...</div>
            ) : (
              <>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {templates.map((tpl, idx) => (
                    <li
                      key={tpl.id}
                      style={{
                        marginBottom: 24,
                        cursor: 'pointer',
                        border: '1px solid #eee',
                        borderRadius: 8,
                        padding: 8,
                        background: '#f7f7f7',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => handleTemplateSelect(tpl)}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          marginBottom: 8,
                          fontSize: '1.1rem',
                        }}
                      >
                        {tpl.name}
                      </div>
                      {tpl.content && (
                        <div style={{ marginTop: 8 }}>
                          <ExtractedDataDisplay
                            extractedData={(() => {
                              try {
                                return JSON.parse(tpl.content);
                              } catch {
                                return [];
                              }
                            })()}
                            presentationSuggestions={[
                              {
                                template_type: tpl.type || 'TABLE',
                                description: tpl.description || '',
                                suitability_reason: tpl.suitability_reason || '',
                              },
                            ]}
                            jobId={tpl.analyserJobId}
                          />
                        </div>
                      )}
                    </li>
                  ))}
                  {templates.length === 0 && (
                    <li style={{ color: '#888', textAlign: 'center' }}>No templates found.</li>
                  )}
                </ul>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 6,
                      border: '1px solid #eee',
                      background: page === 1 ? '#f0f0f0' : '#fafafa',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ alignSelf: 'center', fontSize: 14 }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 6,
                      border: '1px solid #eee',
                      background: page === totalPages ? '#f0f0f0' : '#fafafa',
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
            <button
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                background: 'transparent',
                border: 'none',
                fontSize: 22,
                cursor: 'pointer',
                color: '#888',
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracker;