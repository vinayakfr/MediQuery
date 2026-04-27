"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, FileJson, Download, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";

type DocumentRecord = {
	id: string;
	document_name: string;
	date: string;
	document_type: string;
	ai_status: "analyzed" | "queued" | "failed" | string;
	last_analyzed_at: string;
};

type DocumentsResponse = {
	documents: DocumentRecord[];
};

const API_BASE = "http://localhost:8000";

export default function DocumentsPage() {
	const [documents, setDocuments] = useState<DocumentRecord[]>([]);
	const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [actionBusyId, setActionBusyId] = useState<string | null>(null);

	const fetchDocuments = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`${API_BASE}/documents`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch documents");
			}

			const data: DocumentsResponse = await response.json();
			setDocuments(data.documents || []);

			if (selectedDoc) {
				const updatedSelection = (data.documents || []).find((d) => d.id === selectedDoc.id);
				setSelectedDoc(updatedSelection || null);
			}
		} catch (fetchError) {
			setError(fetchError instanceof Error ? fetchError.message : "Server error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchDocuments();
	}, []);

	const handleDelete = async (documentId: string) => {
		setActionBusyId(documentId);
		setError(null);

		try {
			const response = await fetch(`${API_BASE}/documents/${documentId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Could not delete document");
			}

			const data: DocumentsResponse = await response.json();
			setDocuments(data.documents || []);

			if (selectedDoc?.id === documentId) {
				setSelectedDoc(null);
			}
		} catch (deleteError) {
			setError(deleteError instanceof Error ? deleteError.message : "Delete failed");
		} finally {
			setActionBusyId(null);
		}
	};

	const handleReanalyze = (documentId: string) => {
		setDocuments((prev) =>
			prev.map((doc) =>
				doc.id === documentId
					? {
							...doc,
							ai_status: "queued",
						}
					: doc
			)
		);
	};

	const handleDownloadJson = (doc: DocumentRecord) => {
		const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${doc.document_name.replace(/\.[^/.]+$/, "")}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const statusClassMap: Record<string, string> = {
		analyzed: "text-green-700 bg-green-100/70 border-green-200",
		queued: "text-amber-700 bg-amber-100/70 border-amber-200",
		failed: "text-red-700 bg-red-100/70 border-red-200",
	};

	return (
		<div className="flex-1 h-full flex flex-col pr-2 pb-2 min-h-0">
			<div className="flex justify-between items-start pt-2 pb-6">
				<div>
					<h1 className="text-3xl font-light text-gray-800 tracking-tight">Documents</h1>
					<p className="text-sm text-gray-500 mt-1">
						Structured Medical Files Synced With Your Agentic Pipeline
					</p>
				</div>
                <ActionButton text={"Add Document"} onClick={function (): void {
                    throw new Error("Function not implemented.");
                } } />
			</div>

			<div className="flex-1 glass-panel rounded-3xl p-4 lg:p-6 min-h-0 overflow-hidden flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">User Documents</h2>
					<button
						type="button"
						onClick={() => void fetchDocuments()}
						className="glass-panel-dark rounded-xl px-3 py-2 text-xs text-gray-700 hover:bg-white/40 transition-colors"
					>
						Refresh
					</button>
				</div>

				{error && (
					<div className="rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs text-red-700">
						{error}
					</div>
				)}

				<div className="flex-1 min-h-0 overflow-auto panel-scrollbar rounded-2xl border border-white/50 bg-white/10">
					  <table className="w-full border-separate border-spacing-0 text-sm text-gray-800 min-w-245">
						<thead className="sticky top-0 z-10 backdrop-blur-md">
							<tr>
								{[
									"S.No.",
									"Document Name",
									"Uploaded Date",
									"Type",
									"AI Status",
									"Last Analyzed",
									"Actions",
								].map((header) => (
									<th
										key={header}
										className="glass-panel-dark px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 border-b border-white/20"
									>
										{header}
									</th>
								))}
							</tr>
						</thead>

						<tbody>
							{loading ? (
								<tr>
									<td colSpan={9} className="px-4 py-8 text-center text-gray-500 animate-pulse">
										Fetching documents from backend...
									</td>
								</tr>
							) : documents.length === 0 ? (
								<tr>
									<td colSpan={9} className="px-4 py-8 text-center text-gray-500">
										No documents available.
									</td>
								</tr>
							) : (
								documents.map((doc, index) => (
									<tr key={doc.id} className="hover:bg-white/20 transition-colors">
										<td className="px-4 py-3 border-b border-white/20">{index + 1}</td>
										<td className="px-4 py-3 border-b border-white/20 font-medium">{doc.document_name}</td>
										<td className="px-4 py-3 border-b border-white/20">{doc.date}</td>
										<td className="px-4 py-3 border-b border-white/20">{doc.document_type}</td>
										<td className="px-4 py-3 border-b border-white/20">
											<span
												className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClassMap[doc.ai_status] || "text-gray-700 bg-gray-100/70 border-gray-200"
													}`}
											>
												{doc.ai_status}
											</span>
										</td>
										<td className="px-4 py-3 border-b border-white/20">{doc.last_analyzed_at}</td>
										<td className="px-4 py-3 border-b border-white/20">
											<div className="flex items-center gap-2">
												<button
													type="button"
													title="Re-run AI"
													onClick={() => handleReanalyze(doc.id)}
													className="glass-panel-dark p-2 rounded-lg text-gray-700 hover:text-black"
												>
													<RefreshCw size={14} />
												</button>
												<button
													type="button"
													title="View JSON"
													onClick={() => setSelectedDoc(doc)}
													className="glass-panel-dark p-2 rounded-lg text-gray-700 hover:text-black"
												>
													<FileJson size={14} />
												</button>
												<button
													type="button"
													title="Download JSON"
													onClick={() => handleDownloadJson(doc)}
													className="glass-panel-dark p-2 rounded-lg text-gray-700 hover:text-black"
												>
													<Download size={14} />
												</button>
												<button
													type="button"
													title="Delete"
													onClick={() => void handleDelete(doc.id)}
													disabled={actionBusyId === doc.id}
													className="glass-panel-dark p-2 rounded-lg text-red-600 hover:text-red-700 disabled:opacity-50"
												>
													<Trash2 size={14} />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* <div className="glass-panel-dark rounded-2xl p-4 min-h-32.5">
					<p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
						Document Inspector
					</p>
					{selectedDoc ? (
						<pre className="text-xs text-gray-700 whitespace-pre-wrap wrap-break-word panel-scrollbar max-h-40 overflow-auto">
							{JSON.stringify(selectedDoc, null, 2)}
						</pre>
					) : (
						<p className="text-sm text-gray-500">Select a document row action to inspect its structured payload.</p>
					)}
				</div> */}
			</div>
		</div>
	);
}
