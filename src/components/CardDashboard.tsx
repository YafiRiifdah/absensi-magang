'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ChevronRight } from 'lucide-react' // Icon Calendar, Clock, ChevronRight

interface CardDashboardProps {
  title: string
  onClick: () => void
  isActive: boolean
  icon?: React.ReactNode // Icon bisa berupa JSX element
  description?: string
}

export default function CardDashboard({
  title,
  onClick,
  isActive,
  icon,
  description
}: CardDashboardProps) {
  const getIcon = () => {
    if (icon) return icon

    switch (title) {
      case 'Jadwal Kerja':
        return <Calendar className="w-6 h-6 text-blue-600" />
      case 'Absen':
        return <Clock className="w-6 h-6 text-green-600" />
      default:
        return <Calendar className="w-6 h-6 text-gray-600" /> // Default icon
    }
  }

  const getDescription = () => {
    if (description) return description

    switch (title) {
      case 'Jadwal Kerja':
        return 'Lihat jadwal kerja mingguan Anda'
      case 'Absen':
        return 'Catat kehadiran harian Anda'
      default:
        return 'Klik untuk melihat detail'
    }
  }

  return (
    <Card
      className={`
        cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]
        ${isActive
          ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50'
          : 'hover:shadow-md border-gray-200'
        }
      `}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`
              p-2 rounded-lg
              ${isActive ? 'bg-blue-100' : 'bg-gray-100'}
            `}>
              {getIcon()}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {title}
              </CardTitle>
            </div>
          </div>
          <ChevronRight className={`
            w-5 h-5 transition-transform duration-200
            ${isActive ? 'rotate-90 text-blue-600' : 'text-gray-400'}
          `} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-3">
          {getDescription()}
        </p>
        <Button
          variant={isActive ? "default" : "outline"}
          size="sm"
          className="w-full"
        >
          {isActive ? 'Tutup' : 'Buka'} {title}
        </Button>
      </CardContent>
    </Card>
  );
}