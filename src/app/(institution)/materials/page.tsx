'use client';

import React, { useId, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { FilterBar } from '@/components/ui/FilterBar';
import { StatePreview } from '@/components/ui/StatePreview';
import { DisclosurePanel } from '@/components/ui/Disclosure';

interface ModuleMaterial {
  moduleCode: string;
  moduleTitle: string;
  department: string;
  documents: {
    id: string;
    title: string;
    category: string;
    format: string;
    copyright: string;
    size: string;
  }[];
}

/**
 * Module accordion section.
 * Closed: code, title, department and document count.
 * Open: the module's document packages with download actions.
 */
function ModuleSection({
  mod,
  isOpen,
  onToggle,
}: {
  mod: ModuleMaterial;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  return (
    <article className="bg-surface-container-lowest rounded-xl border border-outline-variant/25 hover:border-outline-variant/60 transition-all">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer rounded-xl outline-none focus-visible:focus-ring"
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-sm px-2.5 py-1 rounded bg-primary-container text-on-primary-container font-bold shrink-0">
            {mod.moduleCode}
          </span>
          <span className="min-w-0">
            <span className="block font-serif text-lg font-bold text-primary leading-tight">{mod.moduleTitle}</span>
            <span className="text-xs text-secondary font-medium block">{mod.department}</span>
          </span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-on-surface bg-surface-container-high px-3 py-1 rounded-full">
            {mod.documents.length} {mod.documents.length === 1 ? 'document' : 'documents'}
          </span>
          <Icon
            className={`text-[20px] text-on-surface-variant transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          >
            expand_more
          </Icon>
        </span>
      </button>

      <DisclosurePanel id={panelId} isOpen={isOpen} className="px-4 sm:px-5 pb-4 sm:pb-5">
        <div className="flex flex-col gap-3 pt-3 border-t border-outline-variant/20">
          {mod.documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <Icon className="text-[20px] text-primary shrink-0 mt-0.5">description</Icon>
                <div>
                  <h3 className="font-serif text-sm font-bold text-on-surface leading-snug">{doc.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-on-surface-variant/80">
                    <span className="font-mono text-[11px] text-primary">{doc.id}</span>
                    <span>•</span>
                    <span>{doc.format}</span>
                    <span>•</span>
                    <span className="font-medium text-secondary">{doc.copyright}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <span className="text-xs text-on-surface-variant/70">{doc.size}</span>
                <button
                  className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary font-semibold text-xs border border-outline-variant/30 hover:border-primary/50 transition-all flex items-center gap-1 cursor-pointer outline-none focus-visible:focus-ring"
                  onClick={() => alert(`Downloading ${doc.id}: ${doc.title}`)}
                  type="button"
                >
                  <span>Download</span>
                  <Icon className="text-[14px]">download</Icon>
                </button>
              </div>
            </div>
          ))}
        </div>
      </DisclosurePanel>
    </article>
  );
}

export default function MaterialsPage() {
  // undefined = nothing chosen yet (first module open); null = all closed.
  const [openModule, setOpenModule] = useState<string | null | undefined>(undefined);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const moduleMaterials: ModuleMaterial[] = [
    {
      moduleCode: 'BIO-410',
      moduleTitle: 'Cellular Signalling Pathways',
      department: 'Nuffield Dept of Medicine',
      documents: [
        {
          id: 'MAT-8012',
          title: 'Tutorial Sheet 3: Receptor Dynamics & Signal Amplification',
          category: 'Tutorial Handout',
          format: 'Interactive PDF (Accessible)',
          copyright: 'CLA Licensed',
          size: '4.2 MB',
        },
        {
          id: 'MAT-8012B',
          title: 'Michaelmas Wk 7 Laboratory Practical Manual & Reagent Protocol',
          category: 'Lab Manual',
          format: 'Searchable PDF',
          copyright: 'CLA Licensed',
          size: '6.1 MB',
        },
      ],
    },
    {
      moduleCode: 'HIST-302',
      moduleTitle: 'Late Imperial Diplomacy',
      department: 'Faculty of History',
      documents: [
        {
          id: 'MAT-8013',
          title: 'Primary Source Reader: 19th Century Diplomatic Protocols',
          category: 'Tutorial Handout',
          format: 'EPUB 3 & Searchable PDF',
          copyright: 'Open Access',
          size: '12.8 MB',
        },
      ],
    },
    {
      moduleCode: 'CS-501',
      moduleTitle: 'Quantum Information & Computing',
      department: 'Dept of Computer Science',
      documents: [
        {
          id: 'MAT-8014',
          title: 'Quantum Laboratory Practical Guide & Code Templates',
          category: 'Lab Manual',
          format: 'Jupyter Notebook & LaTeX PDF',
          copyright: 'Fair Dealing Approved',
          size: '8.6 MB',
        },
        {
          id: 'MAT-8014B',
          title: 'Qubit Error Correction Problem Sheet Set 2',
          category: 'Problem Sheet',
          format: 'Interactive PDF',
          copyright: 'CLA Licensed',
          size: '3.1 MB',
        },
      ],
    },
    {
      moduleCode: 'ECON-204',
      moduleTitle: 'Macroeconomic Policy Architecture',
      department: 'Department of Economics',
      documents: [
        {
          id: 'MAT-8015',
          title: 'Problem Sheet Set 4: Macroeconomic Stabilization Policy',
          category: 'Problem Sheet',
          format: 'Interactive PDF',
          copyright: 'CLA Licensed',
          size: '2.1 MB',
        },
      ],
    },
  ];

  const filteredModules = moduleMaterials.filter((m) => {
    const matchSearch =
      searchQuery === '' ||
      m.moduleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <StatePreview
      loadingLabel="Loading course materials"
      emptyTitle="No course materials found"
      emptyDescription="Try another module search or check back when materials are added."
      errorDescription="Course materials could not be loaded. Check your connection and try again."
    >
    <div className="max-w-max-width mx-auto px-margin-desktop py-space-xl space-y-[var(--spacing-section-gap)] font-body-md text-on-surface">
      {/* PAGE HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-4 border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary font-semibold">
              Content &amp; Syllabi Inventory
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-[32px] text-primary tracking-tight font-bold">
            Course Materials &amp; Handouts Inventory
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant/80 mt-1">
            Tutorial handouts, laboratory manuals, problem sheets, and CLA copyright clearances grouped by course module.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/25 px-4 py-2 rounded-xl flex items-center gap-4 text-xs">
          <div>
            <span className="text-on-surface-variant/70 block">Material Packages</span>
            <span className="font-serif text-lg font-bold text-primary">3,420 Active</span>
          </div>
          <div className="h-6 w-px bg-outline-variant/30"></div>
          <div>
            <span className="text-on-surface-variant/70 block">CLA Clearance</span>
            <span className="font-serif text-lg font-bold text-secondary">98.6%</span>
          </div>
        </div>
      </header>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/25">
        <FilterBar
          activeId={activeCategory}
          onSelect={setActiveCategory}
          options={[
            { id: 'all', label: 'All Modules' },
            { id: 'medsci', label: 'Medical Sciences' },
            { id: 'humanities', label: 'Humanities' },
            { id: 'mpls', label: 'MPLS' },
            { id: 'social', label: 'Social Sciences' },
          ]}
          variant="pills"
        />

        <input
          className="w-64 bg-surface-container-low text-on-surface font-ui-functional text-xs py-1.5 px-3 rounded-lg border border-outline-variant/30 outline-none placeholder:text-on-surface-variant/50 focus:border-primary"
          placeholder="Search module code or title..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* MODULE MATERIALS CARDS INVENTORY */}
      <div className="flex flex-col gap-space-md">
        {filteredModules.map((mod, idx) => {
          // Accordion: one module open at a time; the first opens by default.
          const isOpen = openModule === undefined ? idx === 0 : openModule === mod.moduleCode;
          return (
            <ModuleSection
              key={mod.moduleCode}
              mod={mod}
              isOpen={isOpen}
              onToggle={() => setOpenModule(isOpen ? null : mod.moduleCode)}
            />
          );
        })}
      </div>
    </div>
    </StatePreview>
  );
}
