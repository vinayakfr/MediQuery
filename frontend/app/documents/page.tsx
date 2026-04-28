"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, FileJson, Download, Trash2, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";
import { ApiError, documentsApi, type DocumentRecord } from "@/lib/api";
import { ActionButton } from "@/components/ActionButton";

// Static user ID — replace with auth context once authentication is wired up
const STATIC_USER_ID = "test-user-1";

const STATUS_STYLES: Record<string, string> = {
	analyzed: "text-green-700 bg-green-100/70 border-green-200",
	completed: "text-green-700 bg-green-100/70 border-green-200",
	pending: "text-amber-700 bg-amber-100/70 border-amber-200",
	queued: "text-amber-700 bg-amber-100/70 border-amber-200",
	failed: "text-red-700   bg-red-100/70   border-red-200",
};

const TABS = ["Documents List", "Upload Document"] as const;
type Tab = (typeof TABS)[number];

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
	return (
		<span
			className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status] ?? "text-gray-700 bg-gray-100/70 border-gray-200"
				}`}
		>
			{status}
		</span>
	);
}

function ErrorBanner({ message }: { message: string }) {
	return (
		<div className="rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs text-red-700">
			{message}
		</div>
	);
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
	const [activeTab, setActiveTab] = useState<Tab>("Documents List");

	// ── List state ──
	const [documents, setDocuments] = useState<DocumentRecord[]>([]);
	const [loadingList, setLoadingList] = useState(true);
	const [listError, setListError] = useState<string | null>(null);
	const [busyDocId, setBusyDocId] = useState<string | null>(null);

	// ── Detail panel state ──
	const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);

	// ── Upload state ──
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [uploadSuccess, setUploadSuccess] = useState(false);

	// ── Helpers ──

	const handleApiError = (err: unknown): string =>
		err instanceof ApiError ? err.message : "An unexpected error occurred.";

	// ── Fetch documents ──

	const fetchDocuments = useCallback(async () => {
		setLoadingList(true);
		setListError(null);
		try {
			const data = await documentsApi.list(STATIC_USER_ID);
			setDocuments(data.documents);

			// Keep selected doc in sync if it was already open
			setSelectedDoc((prev) =>
				prev ? (data.documents.find((d) => d.id === prev.id) ?? null) : null
			);
		} catch (err) {
			setListError(handleApiError(err));
		} finally {
			setLoadingList(false);
		}
	}, []);

	useEffect(() => {
		void fetchDocuments();
	}, [fetchDocuments]);

	// ── Document actions ──

	const handleDelete = async (doc: DocumentRecord) => {
		setBusyDocId(doc.id);
		setListError(null);
		try {
			await documentsApi.delete(doc.id);
			setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
			if (selectedDoc?.id === doc.id) setSelectedDoc(null);
		} catch (err) {
			setListError(handleApiError(err));
		} finally {
			setBusyDocId(null);
		}
	};

	const handleDownload = async (doc: DocumentRecord) => {
		setBusyDocId(doc.id);
		setListError(null);
		try {
			const { url } = await documentsApi.getDownloadUrl(doc.storage_path);
			window.open(url, "_blank", "noopener,noreferrer");
		} catch (err) {
			setListError(handleApiError(err));
		} finally {
			setBusyDocId(null);
		}
	};

	// ── Upload handlers ──

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUploadError(null);
		setUploadSuccess(false);
		const file = e.target.files?.[0] ?? null;
		if (file && file.type !== "application/pdf") {
			setUploadError("Only PDF files are supported.");
			setSelectedFile(null);
			// Reset input so user can re-pick
			if (fileInputRef.current) fileInputRef.current.value = "";
			return;
		}
		setSelectedFile(file);
	};

	const handleUpload = async () => {
		if (!selectedFile) return;

		setUploading(true);
		setUploadError(null);
		setUploadSuccess(false);

		try {
			await documentsApi.upload(STATIC_USER_ID, selectedFile);
			setUploadSuccess(true);
			setSelectedFile(null);
			if (fileInputRef.current) fileInputRef.current.value = "";

			// Refresh list in background, then switch tabs after a short pause
			await fetchDocuments();
			setTimeout(() => {
				setActiveTab("Documents List");
				setUploadSuccess(false);
			}, 1500);
		} catch (err) {
			setUploadError(handleApiError(err));
		} finally {
			setUploading(false);
		}
	};

	// ── Render ──────────────────────────────────────────────────────────────────

	return (
		<div className="flex-1 h-full flex flex-col pr-2 pb-2 min-h-0">

			{/* Header */}
			<div className="flex justify-between items-start pt-2 pb-6">
				<div>
					<h1 className="text-3xl font-light text-gray-800 tracking-tight">Documents</h1>
					<p className="text-sm text-gray-500 mt-1">
						Structured Medical Files Synced With Your Agentic Pipeline
					</p>
				</div>
				<ActionButton text="Add Document" onClick={() => setActiveTab("Upload Document")} />
			</div>

			{/* Tabs */}
			<div className="flex-1 flex flex-col min-h-0">
				<div className="flex gap-6 mb-6 border-b border-gray-300/50">
					{TABS.map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === tab
								? "text-gray-900"
								: "text-gray-500 hover:text-gray-700"
								}`}
						>
							{tab}
							{activeTab === tab && (
								<motion.div
									layoutId="activeTabDoc"
									className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800"
								/>
							)}
						</button>
					))}
				</div>

				{/* Content pane */}
				<div className="flex-1 glass-panel rounded-3xl p-4 lg:p-6 min-h-0 overflow-hidden flex flex-col gap-4">

					{/* ── Documents List ── */}
					{activeTab === "Documents List" && (
						<>
							<div className="flex items-center justify-between">
								<h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
									User Documents
								</h2>
								<button
									type="button"
									onClick={() => void fetchDocuments()}
									disabled={loadingList}
									className="glass-panel-dark rounded-xl px-3 py-2 text-xs text-gray-700 hover:bg-white/40 transition-colors disabled:opacity-50 flex items-center gap-1.5"
								>
									<RefreshCw size={12} className={loadingList ? "animate-spin" : ""} />
									Refresh
								</button>
							</div>

							{listError && <ErrorBanner message={listError} />}

							<div className="flex-1 min-h-0 overflow-auto panel-scrollbar rounded-2xl border border-white/50 bg-white/10">
								<table className="w-full border-separate border-spacing-0 text-sm text-gray-800 min-w-245">
									<thead className="sticky top-0 z-10 backdrop-blur-md">
										<tr>
											{["S.No.", "Document Name", "Uploaded Date", "Type", "AI Status", "Actions"].map(
												(header) => (
													<th
														key={header}
														className="glass-panel-dark px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 border-b border-white/20"
													>
														{header}
													</th>
												)
											)}
										</tr>
									</thead>

									<tbody>
										{loadingList ? (
											<tr>
												<td colSpan={6} className="px-4 py-8 text-center text-gray-500 animate-pulse">
													Fetching documents…
												</td>
											</tr>
										) : documents.length === 0 ? (
											<tr>
												<td colSpan={6} className="px-4 py-8 text-center text-gray-500">
													No documents found. Upload one to get started.
												</td>
											</tr>
										) : (
											documents.map((doc, index) => (
												<tr key={doc.id} className="glass-panel transition-colors">
													<td className="px-4 py-3 border-b border-white/20">{index + 1}</td>
													<td className="px-4 py-3 border-b border-white/20 font-medium">
														{doc.filename}
													</td>
													<td className="px-4 py-3 border-b border-white/20">
														{new Date(doc.created_at).toLocaleDateString()}
													</td>
													<td className="px-4 py-3 border-b border-white/20 text-xs text-gray-600">
														{doc.mime_type}
													</td>
													<td className="px-4 py-3 border-b border-white/20">
														<StatusBadge status={doc.ocr_status} />
													</td>
													<td className="px-4 py-3 border-b border-white/20">
														<div className="flex items-center gap-2">
															{/* View JSON */}
															<button
																type="button"
																title="View metadata"
																onClick={() => setSelectedDoc(doc)}
																className="glass-panel-dark p-2 rounded-lg text-gray-700 hover:text-black"
															>
																<FileJson size={14} />
															</button>

															{/* Download */}
															<button
																type="button"
																title="Download document"
																onClick={() => void handleDownload(doc)}
																disabled={busyDocId === doc.id}
																className="glass-panel-dark p-2 rounded-lg text-gray-700 hover:text-black disabled:opacity-50"
															>
																<Download size={14} />
															</button>

															{/* Delete */}
															<button
																type="button"
																title="Delete document"
																onClick={() => void handleDelete(doc)}
																disabled={busyDocId === doc.id}
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

							{/* JSON detail panel */}
							{selectedDoc && (
								<div className="mt-2 rounded-2xl border border-white/30 bg-white/10 p-4">
									<div className="flex items-center justify-between mb-2">
										<span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
											Document Metadata
										</span>
										<button
											type="button"
											onClick={() => setSelectedDoc(null)}
											className="text-xs text-gray-500 hover:text-gray-800"
										>
											Close
										</button>
									</div>
									<pre className="text-xs text-gray-700 overflow-auto max-h-48 panel-scrollbar">
										{JSON.stringify(selectedDoc, null, 2)}
									</pre>
								</div>
							)}
						</>
					)}

					{/* ── Upload Document ── */}
					{activeTab === "Upload Document" && (
						<div className="flex-1 w-full flex flex-col items-center justify-center p-8 gap-6 h-full">
							<div className="w-full max-w-md bg-white/20 p-8 rounded-3xl border border-white/30 backdrop-blur-md shadow-sm flex flex-col items-center justify-center gap-6">
								<div className="w-16 h-16 rounded-full bg-blue-100/50 flex items-center justify-center">
									<UploadCloud className="w-8 h-8 text-blue-600" />
								</div>

								<div className="text-center">
									<h3 className="text-lg font-semibold text-gray-800">Upload PDF Document</h3>
									<p className="text-sm text-gray-500 mt-2">
										Select a PDF file to upload to the agentic pipeline.
									</p>
								</div>

								{/* File picker */}
								<div className="w-full relative">
									<input
										ref={fileInputRef}
										type="file"
										accept="application/pdf"
										onChange={handleFileChange}
										className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
									/>
									<div
										className={`w-full glass-panel-dark h-14 rounded-2xl flex items-center justify-center text-sm font-medium border border-dashed transition-colors ${selectedFile
											? "border-blue-400 text-blue-700"
											: "border-gray-400 text-gray-700 hover:border-gray-600"
											}`}
									>
										{selectedFile ? selectedFile.name : "Click or drag file here"}
									</div>
								</div>

								{/* Feedback */}
								{uploadError && (
									<p className="text-sm text-red-600 text-center">{uploadError}</p>
								)}
								{uploadSuccess && (
									<p className="text-sm text-green-600 text-center">
										✓ Document uploaded successfully!
									</p>
								)}

								<ActionButton
									text={uploading ? "Uploading…" : "Upload Document"}
									onClick={() => void handleUpload()}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}