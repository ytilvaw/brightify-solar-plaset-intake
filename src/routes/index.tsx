import { createFileRoute } from '@tanstack/react-router'
import SolarForm from '../components/SolarForm'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen py-8">
      <SolarForm />
    </div>
  )
}
