import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Trash2,
  Layers,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  validateBackupPayload,
  generateBackupPreview,
  type EntityCounts,
  type ImportMode,
  type ValidationResult,
  type ImportPreview,
} from '@/domain/backup';
import {
  getCurrentEntityCounts,
  triggerDownloadBackup,
  importBackupData,
  clearAllLocalData,
  type ImportResult,
} from '@/services/backupService';
import { useDialogAccessibility } from '@/hooks/useDialogAccessibility';

export interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'export' | 'import' | 'reset';

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('export');
  const [currentCounts, setCurrentCounts] = useState<EntityCounts>({
    topicProgress: 0,
    studySessions: 0,
    mistakes: 0,
    mockTests: 0,
    milestones: 0,
  });

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportedFilename, setLastExportedFilename] = useState<string | null>(null);

  // Import state
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogAccessibility({
    isOpen,
    onClose,
    containerRef: dialogRef,
  });

  // Reset state
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Load latest entity counts whenever modal opens
  useEffect(() => {
    if (isOpen) {
      loadCounts();
      setResetSuccess(false);
      setImportResult(null);
    }
  }, [isOpen]);

  const loadCounts = async () => {
    try {
      const counts = await getCurrentEntityCounts();
      setCurrentCounts(counts);
    } catch (e) {
      console.error('Failed to load entity counts:', e);
    }
  };

  if (!isOpen) return null;

  // Handle Export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const filename = await triggerDownloadBackup();
      setLastExportedFilename(filename);
      await loadCounts();
    } catch (e) {
      console.error('Failed to export backup:', e);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
      const val = validateBackupPayload(content);
      setValidationResult(val);
      if (val.success) {
        const preview = generateBackupPreview(val.payload, currentCounts);
        setImportPreview(preview);
      } else {
        setImportPreview(null);
      }
    };
    reader.readAsText(file);
  };

  // Handle Import Execution
  const handleImport = async () => {
    if (!fileContent) return;

    try {
      setIsImporting(true);
      const res = await importBackupData(fileContent, importMode);
      setImportResult(res);
      if (res.success) {
        await loadCounts();
      }
    } catch (e) {
      console.error('Failed to import backup:', e);
    } finally {
      setIsImporting(false);
    }
  };

  // Handle Database Reset
  const handleResetData = async () => {
    if (resetConfirmInput !== 'RESET') return;

    try {
      setIsResetting(true);
      await clearAllLocalData();
      setResetSuccess(true);
      setResetConfirmInput('');
      await loadCounts();
    } catch (e) {
      console.error('Failed to reset local database:', e);
    } finally {
      setIsResetting(false);
    }
  };

  const totalCurrentRecords =
    currentCounts.topicProgress +
    currentCounts.studySessions +
    currentCounts.mistakes +
    currentCounts.mockTests +
    currentCounts.milestones;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 id="backup-modal-title" className="text-lg font-bold text-foreground">
                Data Backup & Portability
              </h2>
              <p className="text-xs text-muted-foreground">
                Export and restore preparation logs locally with zero cloud dependencies
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-border/60 bg-muted/20" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'export'}
            onClick={() => setActiveTab('export')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-semibold border-b-2 transition-all',
              activeTab === 'export'
                ? 'border-primary text-primary bg-card shadow-xs'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Backup</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'import'}
            onClick={() => setActiveTab('import')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-semibold border-b-2 transition-all',
              activeTab === 'import'
                ? 'border-primary text-primary bg-card shadow-xs'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Restore Backup</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'reset'}
            onClick={() => setActiveTab('reset')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-semibold border-b-2 transition-all ml-auto',
              activeTab === 'reset'
                ? 'border-rose-500 text-rose-500 bg-card shadow-xs'
                : 'border-transparent text-muted-foreground hover:text-rose-500',
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Danger Zone</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-5" data-testid="backup-export-section">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">
                  Current Local Records
                </h3>
                <p className="text-xs text-muted-foreground">
                  All active records currently saved in your browser IndexedDB database.
                </p>
              </div>

              {/* Records Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl border bg-card/60 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <Layers className="h-3 w-3 text-primary" />
                    Topics Tracked
                  </span>
                  <div className="text-xl font-black text-foreground">
                    {currentCounts.topicProgress}
                  </div>
                </div>

                <div className="p-3 rounded-xl border bg-card/60 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-blue-500" />
                    Study Sessions
                  </span>
                  <div className="text-xl font-black text-foreground">
                    {currentCounts.studySessions}
                  </div>
                </div>

                <div className="p-3 rounded-xl border bg-card/60 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-rose-500" />
                    Mistakes Logged
                  </span>
                  <div className="text-xl font-black text-foreground">
                    {currentCounts.mistakes}
                  </div>
                </div>

                <div className="p-3 rounded-xl border bg-card/60 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <FileText className="h-3 w-3 text-amber-500" />
                    Mock Tests
                  </span>
                  <div className="text-xl font-black text-foreground">
                    {currentCounts.mockTests}
                  </div>
                </div>

                <div className="p-3 rounded-xl border bg-card/60 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    Milestones
                  </span>
                  <div className="text-xl font-black text-foreground">
                    {currentCounts.milestones}
                  </div>
                </div>

                <div className="p-3 rounded-xl border bg-primary/5 border-primary/20 space-y-1">
                  <span className="text-[11px] text-primary font-medium">
                    Total Records
                  </span>
                  <div className="text-xl font-black text-primary">
                    {totalCurrentRecords}
                  </div>
                </div>
              </div>

              {lastExportedFilename && (
                <div
                  data-testid="export-success-banner"
                  className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    Successfully exported <strong>{lastExportedFilename}</strong>!
                  </span>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full gap-2 shadow-xs py-5 font-bold"
                >
                  <Download className="h-4 w-4" />
                  <span>
                    {isExporting ? 'Generating Backup...' : 'Download JSON Backup File'}
                  </span>
                </Button>
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  Downloads a self-contained JSON file you can store on Google Drive, GitHub, or your local disk.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT / RESTORE */}
          {activeTab === 'import' && (
            <div className="space-y-5" data-testid="backup-import-section">
              {/* File Drop Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors bg-muted/10 space-y-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="backup-file-input"
                />
                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">
                    {fileName ? fileName : 'Click to select JSON backup file'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Select a previously exported DUET Journey Tracker JSON file
                  </p>
                </div>
              </div>

              {/* Validation Failure */}
              {validationResult && !validationResult.success && (
                <div
                  data-testid="validation-error-banner"
                  className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs space-y-1.5"
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Invalid Backup File</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {validationResult.errors.slice(0, 3).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {validationResult.errors.length > 3 && (
                      <li>...and {validationResult.errors.length - 3} more errors</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Import Preview Card */}
              {importPreview && (
                <div
                  data-testid="import-preview-card"
                  className="p-4 rounded-xl border bg-card space-y-3.5 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-bold text-foreground">
                      Backup File Preview (v{importPreview.version})
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Exported:{' '}
                      {new Date(importPreview.exportedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Summary Comparison Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-muted/40 space-y-1">
                      <span className="text-muted-foreground text-[11px]">Incoming Topics:</span>
                      <div className="font-bold text-foreground">
                        {importPreview.incomingCounts.topicProgress}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/40 space-y-1">
                      <span className="text-muted-foreground text-[11px]">Incoming Sessions:</span>
                      <div className="font-bold text-foreground">
                        {importPreview.incomingCounts.studySessions}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/40 space-y-1">
                      <span className="text-muted-foreground text-[11px]">Incoming Mistakes:</span>
                      <div className="font-bold text-foreground">
                        {importPreview.incomingCounts.mistakes}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/40 space-y-1">
                      <span className="text-muted-foreground text-[11px]">Incoming Mock Tests:</span>
                      <div className="font-bold text-foreground">
                        {importPreview.incomingCounts.mockTests}
                      </div>
                    </div>
                  </div>

                  {/* Import Mode Selector */}
                  <div className="space-y-2 pt-1 border-t">
                    <label className="text-xs font-semibold text-foreground">
                      Restoration Strategy:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setImportMode('merge')}
                        className={cn(
                          'p-2.5 rounded-xl border text-left text-xs transition-colors space-y-1',
                          importMode === 'merge'
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : 'border-border text-muted-foreground hover:bg-muted',
                        )}
                      >
                        <div className="font-bold text-foreground">Merge (Safe)</div>
                        <p className="text-[10px] text-muted-foreground">
                          Preserves current data and appends missing records
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setImportMode('overwrite')}
                        className={cn(
                          'p-2.5 rounded-xl border text-left text-xs transition-colors space-y-1',
                          importMode === 'overwrite'
                            ? 'border-rose-500 bg-rose-500/10 text-rose-500 font-semibold'
                            : 'border-border text-muted-foreground hover:bg-muted',
                        )}
                      >
                        <div className="font-bold text-foreground">Replace All</div>
                        <p className="text-[10px] text-muted-foreground">
                          Erases existing data and restores exact backup
                        </p>
                      </button>
                    </div>
                  </div>

                  {importMode === 'overwrite' && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>
                        Existing local records will be replaced with this backup file.
                      </span>
                    </div>
                  )}

                  {/* Submit Import Button */}
                  <Button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="w-full gap-2 font-bold py-5"
                    variant={importMode === 'overwrite' ? 'destructive' : 'default'}
                  >
                    <span>
                      {isImporting ? 'Restoring Database...' : 'Restore Preparation Data'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Import Success */}
              {importResult && importResult.success && (
                <div
                  data-testid="import-success-banner"
                  className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs space-y-2"
                >
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Data Restored Successfully!</span>
                  </div>
                  <p className="text-[11px]">
                    Restored in <strong>{importResult.mode}</strong> mode. All study sessions, mistakes, test scores, and syllabus marks are updated.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RESET ALL DATA */}
          {activeTab === 'reset' && (
            <div className="space-y-4" data-testid="backup-reset-section">
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2 text-rose-600 dark:text-rose-400 text-xs">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Danger Zone: Clear Local Database</span>
                </div>
                <p className="leading-relaxed">
                  This action permanently deletes all study sessions, mistakes, mock tests, and syllabus progress from your local IndexedDB storage.
                </p>
                <p className="font-semibold text-[11px]">
                  Please ensure you have downloaded a JSON backup before proceeding.
                </p>
              </div>

              {resetSuccess && (
                <div
                  data-testid="reset-success-banner"
                  className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Local preparation database successfully cleared!</span>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <label className="text-xs text-muted-foreground">
                  Type <strong>RESET</strong> below to confirm deletion:
                </label>
                <input
                  type="text"
                  value={resetConfirmInput}
                  onChange={(e) => setResetConfirmInput(e.target.value)}
                  placeholder="RESET"
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-500/50"
                  data-testid="reset-confirm-input"
                />
              </div>

              <Button
                variant="destructive"
                disabled={resetConfirmInput !== 'RESET' || isResetting}
                onClick={handleResetData}
                className="w-full gap-2 font-bold py-5"
                data-testid="confirm-reset-button"
              >
                <Trash2 className="h-4 w-4" />
                <span>{isResetting ? 'Purging Database...' : 'Permanently Delete All Data'}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

