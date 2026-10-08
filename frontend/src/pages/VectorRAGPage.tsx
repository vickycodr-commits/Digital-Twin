import React, { useState, useEffect } from 'react';
import { DocumentItem, RetrievedChunk } from '../types';
import { api } from '../services/api';
import { FileText, Search, BookOpen, Layers, CheckCircle2, FileCheck, ExternalLink } from 'lucide-react';

interface VectorRAGPageProps {
  documents: DocumentItem[];
  defaultQuery?: string;
}

export const VectorRAGPage: React.FC<VectorRAGPageProps> = ({
  documents,
  defaultQuery = 'bearing degradation abnormal vibration'
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(defaultQuery);
  const [retrievedChunks, setRetrievedChunks] = useState<RetrievedChunk[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const handleSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.searchVectorRAG(queryText, 4);
      setRetrievedChunks(res.chunks);
    } catch (err) {
      console.error('Vector search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    handleSearch(searchQuery);
  }, []);

  const sampleQueries = [
    'bearing degradation abnormal vibration',
    'cavitation pressure oscillation flow loss',
    'motor overload winding temperature limit',
    'mechanical seal face dry run leakage',
    'shaft misalignment 2x harmonic vibration'
  ];

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-sky-600" />
          Vector RAG Semantic Technical Retrieval
        </h2>
        <p className="text-xs text-slate-500">
          Semantic vector similarity matching across indexed OEM maintenance manuals, ISO standards, and troubleshooting handbooks.
        </p>
      </div>

      {/* Semantic Search Box & Quick Preset Queries */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery); }}
          className="flex items-center gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search technical manuals (e.g. vibration limits, lubrication, cavitation)..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isSearching ? 'Retrieving...' : 'Search Vector Base'}</span>
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Preset Queries:</span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => { setSearchQuery(q); handleSearch(q); }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-medium transition-colors border border-slate-200"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Retrieved Evidence Chunks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-semibold text-slate-800">
            Retrieved Evidence Chunks ({retrievedChunks.length})
          </span>
          <span>Indexed Corpus: {documents.length} Technical Documents</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {retrievedChunks.map((chunk, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-sky-600 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {chunk.document_title}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-sky-50 text-sky-800 border border-sky-200 shrink-0">
                    Similarity: {chunk.similarity_score}
                  </span>
                </div>

                <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                  <span>{chunk.section || 'General Section'}</span>
                  {chunk.page_number && (
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      Page {chunk.page_number}
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans italic">
                  "{chunk.content}"
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Category: {chunk.document_category}</span>
                <span className="font-medium text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Grounded Evidence
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
