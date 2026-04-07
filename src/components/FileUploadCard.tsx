import type { ChangeEvent } from 'react'

import type { FileFieldName } from '../lib/intake'

export interface SelectedFileState {
  file: File | null
  previewUrl: string | null
}

interface FileUploadCardProps {
  accept: string
  emptyStateLabel: string
  fieldName: FileFieldName
  hint: string
  label: string
  onChange: (field: FileFieldName, event: ChangeEvent<HTMLInputElement>) => void
  selected: SelectedFileState
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileUploadCard(props: FileUploadCardProps) {
  const { accept, emptyStateLabel, fieldName, hint, label, onChange, selected } = props
  const isImagePreview = Boolean(selected.file?.type.startsWith('image/') && selected.previewUrl)

  return (
    <label className="group block cursor-pointer rounded-[28px] border border-[#e9e9ed] bg-white p-4 transition hover:border-[#d8d8de] hover:bg-white">
      <input
        accept={accept}
        className="hidden"
        name={fieldName}
        onChange={(event) => onChange(fieldName, event)}
        type="file"
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[#7a7a86]">
            {label}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#666674]">
            {hint}
          </p>
        </div>

        <div className="rounded-full border border-[#ececf0] bg-[#fafafa] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#666674] transition group-hover:border-[#d8d8de] group-hover:text-[#18181b]">
          {selected.file ? 'Replace' : 'Add'}
        </div>
      </div>

      {isImagePreview ? (
        <div className="mt-4 overflow-hidden rounded-[22px] border border-[#ececf0] bg-white">
          <img
            alt={selected.file ? `${label} preview` : `${label} preview`}
            className="h-44 w-full object-cover"
            src={selected.previewUrl ?? undefined}
          />
          <div className="flex items-center justify-between gap-4 px-4 py-3 text-xs text-[#666674]">
            <span className="truncate">{selected.file?.name}</span>
            <span>{selected.file ? formatFileSize(selected.file.size) : null}</span>
          </div>
        </div>
      ) : selected.file ? (
        <div className="mt-4 rounded-[22px] border border-[#ececf0] bg-white px-4 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[#7a7a86]">
                File Attached
              </p>
              <p className="mt-2 text-sm font-medium text-[#18181b]">{selected.file.name}</p>
            </div>
            <div className="rounded-full border border-[#ececf0] bg-[#fafafa] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#666674]">
              {formatFileSize(selected.file.size)}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-[22px] border border-dashed border-[#d7d7dd] bg-[#fafafa] px-4 py-8 text-center text-sm text-[#777785]">
          {emptyStateLabel}
        </div>
      )}
    </label>
  )
}
