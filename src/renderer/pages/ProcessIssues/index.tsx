import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ProcessIssue } from '../../../workers/types';
import WindowTopBar from '../../components/WindowTopBar';
import useBackupFatalErrors from '../../hooks/BackupFatalErrors';
import useProcessIssues from '../../hooks/ProcessIssues';
import useGeneralIssues from '../../hooks/GeneralIssues';
import ProcessIssuesList from './List';
import { ReportModal } from './ReportModal';

type Section = 'SYNC' | 'BACKUPS' | 'GENERAL';

export default function ProcessIssues() {
  const processIssues = useProcessIssues();
  const generalIssues = useGeneralIssues();
  const backupFatalErrors = useBackupFatalErrors();
  const [reportData, setReportData] = useState<Pick<
    ProcessIssue,
    'errorName' | 'errorDetails'
  > | null>(null);

  const [activeSection, setActiveSection] = useState<Section>('SYNC');

  const processIssuesFilteredByActiveSection = processIssues.filter(
    (issue) => issue.process === activeSection
  );

  useEffect(() => {
    if (
      activeSection === 'SYNC' &&
      processIssuesFilteredByActiveSection.length === 0 &&
      (backupFatalErrors.length || processIssues.length)
    )
      setActiveSection('BACKUPS');
    else if (
      activeSection === 'BACKUPS' &&
      processIssuesFilteredByActiveSection.length === 0 &&
      backupFatalErrors.length === 0 &&
      processIssues.length
    )
      setActiveSection('SYNC');
  }, [processIssues, backupFatalErrors]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-l-neutral-10">
      <WindowTopBar title="Issues" />
      <div className="draggable flex flex-shrink-0 flex-grow-0 items-center justify-center pt-4">
        <Tabs active={activeSection} onClick={setActiveSection} />
      </div>
      <ProcessIssuesList
        selectedTab={activeSection}
        showBackupFatalErrors={activeSection === 'BACKUPS'}
        backupFatalErrors={backupFatalErrors}
        generalIssues={generalIssues}
        processIssues={processIssuesFilteredByActiveSection}
        onClickOnErrorInfo={setReportData}
      />
      <ReportModal
        key={reportData?.errorName}
        data={reportData}
        onClose={() => setReportData(null)}
      />
    </div>
  );
}

function Tabs({
  active,
  onClick,
}: {
  active: Section;
  onClick: (section: Section) => void;
}) {
  const tabWidth = (64 * 4) / 3;
  return (
    <div className="non-draggable relative flex h-9 w-64 rounded-lg bg-l-neutral-30">
      <motion.div
        variants={{
          SYNC: { left: 2, right: 'unset' },
          BACKUPS: { left: tabWidth + 2, right: 'unset' },
          GENERAL: { right: 2, left: 'unset' },
        }}
        animate={active}
        transition={{ ease: 'easeOut' }}
        className="absolute top-1/2 h-8 -translate-y-1/2 rounded-lg bg-white"
        style={{ width: tabWidth }}
      />
      <button
        type="button"
        style={{ width: tabWidth }}
        onClick={() => onClick('SYNC')}
        className={`relative ${
          active === 'SYNC' ? 'text-neutral-500' : 'text-m-neutral-80'
        }`}
      >
        Sync
      </button>
      <button
        type="button"
        style={{ width: tabWidth }}
        onClick={() => onClick('BACKUPS')}
        className={`relative ${
          active === 'BACKUPS' ? 'text-neutral-500' : 'text-m-neutral-80'
        }`}
      >
        Backups
      </button>
      <button
        type="button"
        style={{ width: tabWidth }}
        onClick={() => onClick('GENERAL')}
        className={`relative ${
          active === 'GENERAL' ? 'text-neutral-500' : 'text-m-neutral-80'
        }`}
      >
        General
      </button>
    </div>
  );
}
