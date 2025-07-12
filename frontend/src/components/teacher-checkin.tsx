"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, MapPin, Calendar, CheckCircle, XCircle } from "lucide-react"
import type { Teacher, CheckInRecord } from "@/app/page"

interface TeacherCheckInProps {
  currentUser: Teacher
  checkInRecords: CheckInRecord[]
  onCheckIn: (record: Omit<CheckInRecord, "id">) => void
  onCheckOut: (recordId: string, checkOutTime: string) => void
}

export function TeacherCheckIn({ currentUser, checkInRecords, onCheckIn, onCheckOut }: TeacherCheckInProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [todayRecord, setTodayRecord] = useState<CheckInRecord | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const today = new Date().toDateString()
    const record = checkInRecords.find(
      (r) => r.teacherId === currentUser.id && new Date(r.checkInTime).toDateString() === today,
    )
    setTodayRecord(record || null)
    setIsCheckedIn(!!record && !record.checkOutTime)
  }, [checkInRecords, currentUser.id])

  const handleCheckIn = () => {
    const now = new Date()
    onCheckIn({
      teacherId: currentUser.id,
      checkInTime: now.toISOString(),
      location: "Main Campus",
      status: "Present",
    })
  }

  const handleCheckOut = () => {
    if (todayRecord) {
      onCheckOut(todayRecord.id, new Date().toISOString())
    }
  }

  const getInitials = (name: string) => {
    return name?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getWorkingHours = () => {
    if (!todayRecord) return "Not checked in"
    if (!todayRecord.checkOutTime) return "Currently working"

    const checkIn = new Date(todayRecord.checkInTime)
    const checkOut = new Date(todayRecord.checkOutTime)
    const diff = checkOut.getTime() - checkIn.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  const recentRecords = checkInRecords
    .filter((r) => r.teacherId === currentUser.id)
    .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
    .slice(0, 7)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Check In/Out</h2>
        <p className="text-muted-foreground">Track your attendance and working hours</p>
      </div>

      {/* Current Status Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.fullName} />
                <AvatarFallback>{getInitials(currentUser.fullName)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{currentUser.fullName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {currentUser.role} • {currentUser.subject}
                </p>
              </div>
            </div>
            <Badge variant={isCheckedIn ? "default" : "secondary"} className="text-sm">
              {isCheckedIn ? "Checked In" : "Checked Out"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Current Time</p>
                <p className="text-lg font-mono">{currentTime.toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Today&apos;s Status</p>
                <p className="text-sm">{todayRecord ? "Present" : "Not checked in"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm">{todayRecord?.location || "N/A"}</p>
              </div>
            </div>
          </div>

          {todayRecord && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm font-medium">Check In Time</p>
                <p className="text-lg font-mono">{formatTime(todayRecord.checkInTime)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Check Out Time</p>
                <p className="text-lg font-mono">
                  {todayRecord.checkOutTime ? formatTime(todayRecord.checkOutTime) : "--:--"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Working Hours</p>
                <p className="text-lg font-mono">{getWorkingHours()}</p>
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            {!isCheckedIn ? (
              <Button onClick={handleCheckIn} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Check In
              </Button>
            ) : (
              <Button onClick={handleCheckOut} variant="outline" className="flex-1 bg-transparent">
                <XCircle className="h-4 w-4 mr-2" />
                Check Out
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{new Date(record.checkInTime).toLocaleDateString()}</span>
                  </div>
                  <Badge variant={record.status === "Present" ? "default" : "secondary"}>{record.status}</Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">In: </span>
                    <span className="font-mono">{formatTime(record.checkInTime)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Out: </span>
                    <span className="font-mono">{record.checkOutTime ? formatTime(record.checkOutTime) : "--:--"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hours: </span>
                    <span className="font-mono">
                      {record.checkOutTime
                        ? `${Math.floor((new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) / (1000 * 60 * 60))}h`
                        : "--"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {recentRecords.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No attendance records found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
