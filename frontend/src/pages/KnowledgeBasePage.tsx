import React, { useState } from 'react';
import { DocumentItem } from '../types';
import { api } from '../services/api';
import { BookOpen, Upload, Trash2, RefreshCw, FileText, CheckCircle2, Layers, AlertCircle } from 'lucide-react';

interface KnowledgeBasePageProps {
  documents: DocumentItem[];
  onRefresh: () => void;
}

export const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({
  documents,
  onRefresh
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setStatusMsg('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (uploadTitle) formData.append('title', uploadTitle);

      await api.uploadDocument(formData);
      setStatusMsg('Document successfully ingested and indexed into Vector RAG!');
      setUploadTitle('');
      setSelectedFile(null);
      onRefresh();
    } catch (err: any) {
      setStatusMsg(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await api.deleteDocument(docId);
      onRefresh();
    } catch (err: any) {
      alert(`Cannot delete system baseline document: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-sky-600" />
          Technical Knowledge Base & Document Management
        </h2>
        <p className="text-xs text-slate-500">
          Manage, ingest, and index technical documentation, OEM operating handbooks, and troubleshooting standards into Vector RAG.
        </p>
      </div>

      {/* Document Upload Console */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-sky-600" />
              Ingest Technical Document (PDF, TXT, DOCX, Markdown)
            </h3>
            <p className="text-xs text-slate-500">
              Files are automatically parsed, chunked, and indexed into the local vector space
            </p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5 space-y-1">
            <label className="text-[11px] font-semibold text-slate-700">Document Title</label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g. Mechanical Seal Overhaul Standard API 682"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="md:col-span-4 space-y-1">
            <label className="text-[11px] font-semibold text-slate-700">Select File</label>
            <input
              type="file"
              accept=".pdf,.txt,.docx,.md"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Chunking & Indexing...' : 'Upload & Index'}</span>
            </button>
          </div>
        </form>

        {statusMsg && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>

      {/* Indexed Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Indexed Corpus Library ({documents.length})
            </h3>
            <p className="text-xs text-slate-500">
              Active documents partitioned into semantically searchable chunk vectors
            </p>
          </div>

          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Index</span>
          </button>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Title & Filename</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Chunk Count</th>
                <th className="py-2.5 px-3">Vector Status</th>
                <th className="py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{doc.title}</div>
                    <div className="text-[11px] font-mono text-slate-400">{doc.filename}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                    {doc.category}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                      {doc.file_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-800">
                    {doc.chunk_count} Chunks
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
