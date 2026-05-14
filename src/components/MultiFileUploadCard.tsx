import type { ChangeEvent } from 'react'

import type { IntakeUploadFieldName } from '../lib/intake'
import type { SelectedFileState } from './FileUploadCard'

interface MultiFileUploadCardProps {
  accept: string
  emptyStateLabel: string
  fieldName: IntakeUploadFieldName
  hint: string
  label: string
  onChange: (
    field: IntakeUploadFieldName,
    event: ChangeEvent<HTMLInputElement>,
  ) => void
  selectedFiles: SelectedFileState[]
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MultiFileUploadCard(props: MultiFileUploadCardProps) {
  const {
    accept,
    emptyStateLabel,
    fieldName,
    hint,
    label,
    onChange,
    selectedFiles,
  } = props
  const hasFiles = selectedFiles.length > 0

  return (
    <label className="group block cursor-pointer rounded-[28px] border border-[#e9e9ed] bg-white p-4 transition hover:border-[#d8d8de] hover:bg-white">
      <input
        accept={accept}
        className="hidden"
        multiple
        name={fieldName}
        onChange={(event) => onChange(fieldName, event)}
        type="file"
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[#7a7a86]">
            {label}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#666674]">{hint}</p>
        </div>

        <div className="rounded-full border border-[#ececf0] bg-[#fafafa] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#666674] transition group-hover:border-[#d8d8de] group-hover:text-[#18181b]">
          {hasFiles ? 'Replace' : 'Add Files'}
        </div>
      </div>

      {hasFiles ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {selectedFiles.map((selectedFile) => (
            <div
              className="overflow-hidden rounded-[22px] border border-[#ececf0] bg-white"
              key={`${selectedFile.file?.name ?? 'file'}-${selectedFile.file?.lastModified ?? 0}`}
            >
              {selectedFile.previewUrl ? (
                <img
                  alt={selectedFile.file ? `${selectedFile.file.name} preview` : 'File preview'}
                  className="h-32 w-full object-cover"
                  src={selectedFile.previewUrl}
                />
              ) : null}

              <div className="flex items-center justify-between gap-4 px-4 py-3 text-xs text-[#666674]">
                <span className="truncate">{selectedFile.file?.name}</span>
                <span className="shrink-0">
                  {selectedFile.file ? formatFileSize(selectedFile.file.size) : null}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[22px] border border-dashed border-[#d7d7dd] bg-[#fafafa] px-4 py-8 text-center text-sm text-[#777785]">
          {emptyStateLabel}
        </div>
      )}
    </label>
  )
}
