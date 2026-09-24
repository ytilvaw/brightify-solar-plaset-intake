import { useEffect, useMemo, useState } from 'react'

import type { OrderRecord } from '../lib/orders'

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

function formatMoney(cents: number, currency: string) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: currency.toUpperCase() || 'USD',
  })
}

function AdminKeyForm(props: { onSubmit: (value: string) => void }) {
  const { onSubmit } = props
  const [value, setValue] = useState('')

  return (
    <section className="mx-auto max-w-xl rounded-[36px] border border-[#ececf0] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8">
      <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#18181b]">
        Order Review
      </h1>
      <p className="mt-3 text-base leading-7 text-[#666674]">
        Enter the admin access key to review purchases made on the design page.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(value.trim())
        }}
      >
        <div>
          <label className="field-label" htmlFor="adminAccessKey">
            Admin Access Key
          </label>
          <input
            className="field-input"
            id="adminAccessKey"
            onChange={(event) => setValue(event.target.value)}
            type="password"
            value={value}
          />
        </div>

        <button
          className="inline-flex items-center justify-center rounded-full bg-[#f3a43a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-[0_12px_30px_rgba(243,164,58,0.18)] transition hover:bg-[#e8982a]"
          type="submit"
        >
          Open Review
        </button>
      </form>
    </section>
  )
}

function OrderCard(props: { order: OrderRecord }) {
  const { order } = props

  return (
    <article className="rounded-[32px] border border-[#ececf0] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-[#ececf0] pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#18181b]">
            {order.customerName || order.customerEmail || 'Unnamed customer'}
          </h2>
          <p className="mt-1 text-sm text-[#666674]">{order.customerEmail || '—'}</p>
        </div>
        <div className="text-sm text-[#666674] md:text-right">
          <div>{formatDate(order.createdAt)}</div>
          <div className="mt-1 font-mono text-xs text-[#8a8a98]">{order.orderId}</div>
          <span
            className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
              order.paymentStatus === 'paid'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {order.paymentStatus || 'unknown'}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-[24px] bg-[#fafafa] p-4">
        <div className="flex items-center justify-between">
          <p className="field-label">Purchase breakdown</p>
          <span className="text-sm text-[#666674]">
            {order.lineItems.length} item{order.lineItems.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="mt-3 space-y-2 text-sm text-[#2d2d34]">
          {order.lineItems.map((item) => (
            <div className="flex items-center justify-between" key={item.id}>
              <span>{item.label}</span>
              <span className="font-medium">{formatMoney(item.price, order.currency)}</span>
            </div>
          ))}
          {!order.lineItems.length ? (
            <p className="text-[#8a8a98]">No line item detail on this order.</p>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#ececf0] pt-3 text-base font-semibold text-[#18181b]">
          <span>Total</span>
          <span>{formatMoney(order.amountTotal, order.currency)}</span>
        </div>
      </div>
    </article>
  )
}

export default function OrdersPage() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('adminAccessKey') ?? '')
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const hasKey = useMemo(() => adminKey.trim().length > 0, [adminKey])

  useEffect(() => {
    if (!hasKey) {
      return
    }

    let cancelled = false

    async function loadOrders() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/admin/orders', {
          headers: {
            Authorization: `Bearer ${adminKey}`,
          },
        })

        const result = (await response.json()) as
          | { error?: string; orders?: OrderRecord[] }
          | undefined

        if (!response.ok) {
          throw new Error(result?.error ?? 'Unable to load orders.')
        }

        if (!cancelled) {
          setOrders(result?.orders ?? [])
          localStorage.setItem('adminAccessKey', adminKey)
        }
      } catch (loadError) {
        if (!cancelled) {
          setOrders([])
          setError(loadError instanceof Error ? loadError.message : 'Unable to load orders.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      cancelled = true
    }
  }, [adminKey, hasKey])

  const totalRevenue = orders.reduce((sum, order) => sum + order.amountTotal, 0)

  if (!hasKey) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-18 pt-6 sm:px-6 lg:px-8">
        <AdminKeyForm onSubmit={setAdminKey} />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-18 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[36px] border border-[#ececf0] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#18181b]">
              Order Review
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#666674]">
              Every completed purchase from the design page, with a full breakdown of tier and
              add-ons bought.
            </p>
            {orders.length ? (
              <p className="mt-2 text-sm font-semibold text-[#18181b]">
                {orders.length} order{orders.length === 1 ? '' : 's'} ·{' '}
                {formatMoney(totalRevenue, orders[0]?.currency ?? 'usd')} total
              </p>
            ) : null}
          </div>

          <div className="flex gap-3">
            <a
              className="rounded-full border border-[#ececf0] px-4 py-2 text-sm text-[#666674] transition hover:border-[#d7d7dd] hover:text-[#18181b]"
              href="/admin"
            >
              Submissions
            </a>
            <button
              className="rounded-full border border-[#ececf0] px-4 py-2 text-sm text-[#666674] transition hover:border-[#d7d7dd] hover:text-[#18181b]"
              onClick={() => {
                localStorage.removeItem('adminAccessKey')
                setAdminKey('')
              }}
              type="button"
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 rounded-[24px] border border-[#ececf0] bg-white px-5 py-8 text-sm text-[#666674] shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
          Loading orders...
        </div>
      ) : null}

      {!loading && !error && orders.length === 0 ? (
        <div className="mt-6 rounded-[24px] border border-[#ececf0] bg-white px-5 py-8 text-sm text-[#666674] shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
          No orders found yet.
        </div>
      ) : null}

      <div className="mt-6 space-y-6">
        {orders.map((order) => (
          <OrderCard key={order.orderId} order={order} />
        ))}
      </div>
    </main>
  )
}
