import { NextResponse } from "next/server"

// Global variable to track backup progress
// In a production app, you might want to use Redis or another store
let backupProgress = {
  inProgress: false,
  current: 0,
  total: 0,
  startTime: new Date(),
}

export function GET() {
  return NextResponse.json(backupProgress)
}

// Export these functions to be used by the backup API
export function startBackupProgress(total: number) {
  backupProgress = {
    inProgress: true,
    current: 0,
    total,
    startTime: new Date(),
  }
}

export function updateBackupProgress(current: number) {
  backupProgress.current = current
}

export function finishBackupProgress() {
  backupProgress.inProgress = false
}
