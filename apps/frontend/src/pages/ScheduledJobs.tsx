import React, { useState, useEffect } from 'react';
import { getScheduledAnalysis } from '../services';
import { ExtractedDataDisplay } from '../components/ExtractedDataDisplay';

const GRID_ROWS = 2;
const GRID_COLS = 3;
const GRID_SIZE = GRID_ROWS * GRID_COLS;

const Tracker: React.FC = () => {
  // Each grid cell can have a scheduled analysis or null
  const [gridAnalysis, setGridAnalysis] = useState<(any | null)[]>(Array(GRID_SIZE).fill(null));
  const [showModal, setShowModal] = useState(false);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGridIdx, setSelectedGridIdx] = useState<number | null>(null);

  // Fetch scheduled analyses with pagination when modal opens or page changes
  useEffect(() => {
    if (showModal) {
      setLoading(true);
      getScheduledAnalysis()
        .then((res) => {
          setAnalyses(res.scheduledAnalysis || res); // support both array and {scheduledAnalysis}
          setTotalPages(1); // No pagination, so just 1 page
        })
        .finally(() => setLoading(false));
    }
  }, [showModal]);

  // Open modal for a specific grid cell
  const handleAddClick = (idx: number) => {
    setSelectedGridIdx(idx);
    setShowModal(true);
    setPage(1);
  };

  // Assign scheduled analysis to grid cell
  const handleAnalysisSelect = (analysis: any) => {
    if (selectedGridIdx !== null) {
      setGridAnalysis((prev) => {
        const updated = [...prev];
        updated[selectedGridIdx] = analysis;
        return updated;
      });
    }
    setShowModal(false);
    setSelectedGridIdx(null);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedGridIdx(null);
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
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
          gap: '24px',
          width: '75%',
          height: '100%',
        }}
      >
        {gridAnalysis.map((analysis, idx) => (
          <div
            key={idx}
            style={{
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              color: '#888',
              width: '100%',
              aspectRatio: '1 / 1',
              boxSizing: 'border-box',
              transition: 'box-shadow 0.2s',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {analysis ? (
              <ExtractedDataDisplay
                extractedData={(() => {
                  try {
                    return JSON.parse(analysis.content);
                  } catch {
                    return [];
                  }
                })()}
                presentationSuggestions={[
                  {
                    template_type: analysis.type || 'TABLE',
                    description: analysis.description || '',
                    suitability_reason: analysis.suitability_reason || '',
                  },
                ]}
                jobId={analysis.analyserJobId}
              />
            ) : (
              <button
                onClick={() => handleAddClick(idx)}
                style={{
                  background: 'none',
                  border: '2px dashed #bbb',
                  borderRadius: '8px',
                  width: '80%',
                  height: '80%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  color: '#bbb',
                  cursor: 'pointer',
                  transition: 'border 0.2s',
                }}
                title="Add scheduled analysis"
              >
                +
              </button>
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
            <h2 style={{ marginTop: 0 }}>Choose a scheduled analysis</h2>
            {loading ? (
              <div>Loading scheduled analyses...</div>
            ) : (
              <>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {analyses.map((analysis, idx) => (
                    <li
                      key={analysis.id}
                      style={{
                        marginBottom: 24,
                        cursor: 'pointer',
                        border: '1px solid #eee',
                        borderRadius: 8,
                        padding: 8,
                        background: '#f7f7f7',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => handleAnalysisSelect(analysis)}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          marginBottom: 8,
                          fontSize: '1.1rem',
                        }}
                      >
                        {analysis.name}
                      </div>
                      {analysis.content && (
                        <div style={{ marginTop: 8 }}>
                          <ExtractedDataDisplay
                            extractedData={(() => {
                              try {
                                return JSON.parse(analysis.content);
                              } catch {
                                return [];
                              }
                            })()}
                            presentationSuggestions={[
                              {
                                template_type: analysis.type || 'TABLE',
                                description: analysis.description || '',
                                suitability_reason: analysis.suitability_reason || '',
                              },
                            ]}
                            jobId={analysis.analyserJobId}
                          />
                        </div>
                      )}
                    </li>
                  ))}
                  {analyses.length === 0 && (
                    <li style={{ color: '#888', textAlign: 'center' }}>No scheduled analyses found.</li>
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