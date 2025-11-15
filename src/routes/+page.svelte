<script lang="ts">
	import { onMount } from 'svelte';
	import Papa from 'papaparse';
	
	let pdfjsLib: any;
	let fileInput: HTMLInputElement;
	let pdfFile: File | null = $state(null);
	let showModal = $state(false);
	let pdfDataUrl: string | null = $state(null);
	let isProcessing = $state(false);
	let errorMessage: string | null = $state(null);
	
	// Load PDF.js only on the client side
	onMount(async () => {
		pdfjsLib = await import('pdfjs-dist');
		pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
	});
	
	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file && file.type === 'application/pdf') {
			pdfFile = file;
			errorMessage = null;
			
			// Convert file to data URL for display
			const reader = new FileReader();
			reader.onload = (e) => {
				pdfDataUrl = e.target?.result as string;
				showModal = true;
			};
			reader.readAsDataURL(file);
		} else {
			errorMessage = 'Please select a valid PDF file';
		}
	}
	
	function closeModal() {
		showModal = false;
		pdfFile = null;
		pdfDataUrl = null;
		errorMessage = null;
		if (fileInput) {
			fileInput.value = '';
		}
	}
	
	async function extractTablesAndConvertToCsv() {
		if (!pdfFile || !pdfjsLib) return;
		
		isProcessing = true;
		errorMessage = null;
		
		try {
			const arrayBuffer = await pdfFile.arrayBuffer();
			const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
			
			const allTableData: string[][] = [];
			
			// Extract text from all pages
			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i);
				const textContent = await page.getTextContent();
				
				// Simple heuristic: group text items into rows based on Y position
				const lines: Map<number, string[]> = new Map();
				
				textContent.items.forEach((item: any) => {
					if (item.str && item.str.trim()) {
						const y = Math.round(item.transform[5]);
						if (!lines.has(y)) {
							lines.set(y, []);
						}
						lines.get(y)!.push(item.str.trim());
					}
				});
				
				// Convert lines to rows
				const sortedY = Array.from(lines.keys()).sort((a, b) => b - a);
				sortedY.forEach(y => {
					const rowData = lines.get(y)!;
					if (rowData.length > 1) { // Consider it a table row if it has multiple columns
						allTableData.push(rowData);
					}
				});
			}
			
			// Convert to CSV
			if (allTableData.length > 0) {
				const csv = Papa.unparse(allTableData);
				
				// Download CSV
				const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
				const link = document.createElement('a');
				const url = URL.createObjectURL(blob);
				link.setAttribute('href', url);
				link.setAttribute('download', `${pdfFile.name.replace('.pdf', '')}_tables.csv`);
				link.style.visibility = 'hidden';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			} else {
				errorMessage = 'No table data found in the PDF';
			}
		} catch (error) {
			console.error('Error processing PDF:', error);
			errorMessage = 'Failed to extract tables from PDF';
		} finally {
			isProcessing = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
	<div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
		<h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">PDF Table Extractor</h1>
		
		<div class="mb-4">
			<label
				for="pdf-upload"
				class="block text-sm font-medium text-gray-700 mb-2"
			>
				Upload PDF File
			</label>
			<input
				bind:this={fileInput}
				id="pdf-upload"
				type="file"
				accept="application/pdf"
				onchange={handleFileUpload}
				class="block w-full text-sm text-gray-500
					file:mr-4 file:py-2 file:px-4
					file:rounded-md file:border-0
					file:text-sm file:font-semibold
					file:bg-blue-50 file:text-blue-700
					hover:file:bg-blue-100
					cursor-pointer"
			/>
		</div>
		
		{#if errorMessage}
			<div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
				<p class="text-sm text-red-600">{errorMessage}</p>
			</div>
		{/if}
		
		<div class="mt-6 text-center text-sm text-gray-600">
			<p>Upload a PDF file to extract tables and convert them to CSV</p>
		</div>
	</div>
</div>

{#if showModal && pdfDataUrl}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
			<!-- Modal Header -->
			<div class="flex items-center justify-between p-4 border-b">
				<h2 class="text-xl font-semibold text-gray-800">PDF Preview</h2>
				<button
					onclick={closeModal}
					class="text-gray-400 hover:text-gray-600 transition-colors"
					aria-label="Close modal"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<!-- Modal Body -->
			<div class="flex-1 overflow-auto p-4">
				<iframe
					src={pdfDataUrl}
					title="PDF Preview"
					class="w-full h-[60vh] border rounded"
				></iframe>
			</div>
			
			<!-- Modal Footer -->
			<div class="p-4 border-t bg-gray-50 flex justify-end gap-3">
				<button
					onclick={closeModal}
					class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
				>
					Close
				</button>
				<button
					onclick={extractTablesAndConvertToCsv}
					disabled={isProcessing}
					class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
				>
					{isProcessing ? 'Processing...' : 'Convert to CSV'}
				</button>
			</div>
		</div>
	</div>
{/if}
