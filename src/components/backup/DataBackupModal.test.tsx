import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataBackupModal } from './DataBackupModal';
import * as backupService from '@/services/backupService';
import { BACKUP_APP_NAME, CURRENT_BACKUP_VERSION } from '@/domain/backup';

vi.mock('@/services/backupService', () => ({
  getCurrentEntityCounts: vi.fn(),
  triggerDownloadBackup: vi.fn(),
  importBackupData: vi.fn(),
  clearAllLocalData: vi.fn(),
}));

describe('DataBackupModal', () => {
  const mockCounts = {
    topicProgress: 15,
    studySessions: 20,
    mistakes: 5,
    mockTests: 2,
    milestones: 4,
  };

  const sampleValidBackup = {
    version: CURRENT_BACKUP_VERSION,
    appName: BACKUP_APP_NAME,
    exportedAt: '2026-10-12T10:00:00.000Z',
    data: {
      topicProgress: [{ topicId: 'math-01', status: 'strong', updatedAt: '' }],
      studySessions: [
        {
          id: 1,
          date: '2026-10-05',
          subjectId: 'math',
          topicId: 'math-01',
          durationMinutes: 60,
          questionsSolved: 30,
          correctAnswers: 25,
          createdAt: '',
        },
      ],
      mistakes: [],
      mockTests: [],
      milestones: [],
    },
    summary: {
      totalTopicsTracked: 1,
      totalSessions: 1,
      totalMistakes: 0,
      totalMockTests: 0,
      totalMilestones: 0,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(backupService.getCurrentEntityCounts).mockResolvedValue(mockCounts);
    vi.mocked(backupService.triggerDownloadBackup).mockResolvedValue(
      'duet-2027-journey-tracker-backup-2026-10-12.json',
    );
    vi.mocked(backupService.importBackupData).mockResolvedValue({
      success: true,
      mode: 'merge',
      restoredCounts: {
        topicProgress: 1,
        studySessions: 1,
        mistakes: 0,
        mockTests: 0,
        milestones: 0,
      },
    });
    vi.mocked(backupService.clearAllLocalData).mockResolvedValue();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<DataBackupModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal dialog and loads entity counts when isOpen is true', async () => {
    render(<DataBackupModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Data Backup & Portability')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument(); // topicProgress
      expect(screen.getByText('20')).toBeInTheDocument(); // studySessions
    });
  });

  it('triggers backup download when Download button is clicked in Export tab', async () => {
    render(<DataBackupModal isOpen={true} onClose={vi.fn()} />);

    const downloadBtn = screen.getByRole('button', { name: /Download JSON Backup File/i });
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(backupService.triggerDownloadBackup).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('export-success-banner')).toBeInTheDocument();
    });
  });

  it('switches to Restore tab and displays file picker', () => {
    render(<DataBackupModal isOpen={true} onClose={vi.fn()} />);

    const restoreTab = screen.getByRole('tab', { name: /Restore Backup/i });
    fireEvent.click(restoreTab);

    expect(screen.getByTestId('backup-import-section')).toBeInTheDocument();
    expect(screen.getByText(/Click to select JSON backup file/i)).toBeInTheDocument();
  });

  it('handles valid JSON upload, displays preview card, and executes import', async () => {
    render(<DataBackupModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('tab', { name: /Restore Backup/i }));

    const file = new File([JSON.stringify(sampleValidBackup)], 'backup.json', {
      type: 'application/json',
    });
    const input = screen.getByTestId('backup-file-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByTestId('import-preview-card')).toBeInTheDocument();
      expect(screen.getByText(/Backup File Preview/i)).toBeInTheDocument();
    });

    // Toggle mode to Replace All
    const replaceModeBtn = screen.getByRole('button', { name: /Replace All/i });
    fireEvent.click(replaceModeBtn);

    // Submit import
    const restoreBtn = screen.getByRole('button', { name: /Restore Preparation Data/i });
    fireEvent.click(restoreBtn);

    await waitFor(() => {
      expect(backupService.importBackupData).toHaveBeenCalledWith(
        JSON.stringify(sampleValidBackup),
        'overwrite',
      );
      expect(screen.getByTestId('import-success-banner')).toBeInTheDocument();
    });
  });

  it('shows error banner when corrupt JSON is uploaded', async () => {
    render(<DataBackupModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('tab', { name: /Restore Backup/i }));

    const corruptFile = new File(['{ invalid json'], 'corrupt.json', {
      type: 'application/json',
    });
    const input = screen.getByTestId('backup-file-input');

    fireEvent.change(input, { target: { files: [corruptFile] } });

    await waitFor(() => {
      expect(screen.getByTestId('validation-error-banner')).toBeInTheDocument();
      expect(screen.getByText('Invalid Backup File')).toBeInTheDocument();
    });
  });

  it('handles Danger Zone reset requiring RESET text confirmation', async () => {
    render(<DataBackupModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('tab', { name: /Danger Zone/i }));

    expect(screen.getByTestId('backup-reset-section')).toBeInTheDocument();

    const deleteBtn = screen.getByTestId('confirm-reset-button');
    expect(deleteBtn).toBeDisabled();

    // Type incorrect text
    const confirmInput = screen.getByTestId('reset-confirm-input');
    fireEvent.change(confirmInput, { target: { value: 'WRONG' } });
    expect(deleteBtn).toBeDisabled();

    // Type exact RESET
    fireEvent.change(confirmInput, { target: { value: 'RESET' } });
    expect(deleteBtn).not.toBeDisabled();

    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(backupService.clearAllLocalData).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('reset-success-banner')).toBeInTheDocument();
    });
  });

  it('invokes onClose when Close button or X is clicked', () => {
    const handleClose = vi.fn();
    render(<DataBackupModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: /^Close$/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

