import type { ChangeEvent } from 'react'

import type { FileFieldName } from '../lib/intake'

export interface SelectedFileState {
  file: File | null
  previewUrl: string | null
}

interface FileUploadCardProps {
  accept: string
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
  const { accept, fieldName, hint, label, onChange, selected } = props

  return (
    <label className="group block cursor-pointer rounded-[28px] border border-white/12 bg-white/6 p-4 transition hover:border-[#f1b24a]/50 hover:bg-white/10">
      <input
        accept={accept}
        className="hidden"
        name={fieldName}
        onChange={(event) => onChange(fieldName, event)}
        type="file"
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f1b24a]">
            {label}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {hint}
          </p>
        </div>

        <div className="rounded-full border border-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 transition group-hover:border-[#f1b24a]/50 group-hover:text-white">
          {selected.file ? 'Replace' : 'Add'}
        </div>
      </div>

      {selected.previewUrl ? (
        <div className="mt-4 overflow-hidden rounded-[22px] border border-white/12 bg-slate-950">
          <img
            alt={selected.file ? `${label} preview` : `${label} preview`}
            className="h-44 w-full object-cover"
            src={selected.previewUrl}
          />
          <div className="flex items-center justify-between gap-4 px-4 py-3 text-xs text-slate-300">
            <span className="truncate">{selected.file?.name}</span>
            <span>{selected.file ? formatFileSize(selected.file.size) : null}</span>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-[22px] border border-dashed border-white/12 bg-slate-950/40 px-4 py-8 text-center text-sm text-slate-400">
          JPG, PNG, WEBP, HEIC, or HEIF
        </div>
      )}
    </label>
  )
}
