'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestSupabase() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.auth.getUser()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setUser(data.user)
      })
  }, [])

  return (
    <div>
      <h1>Supabase Test</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <p>User: {user ? JSON.stringify(user) : 'No user logged in'}</p>
    </div>
  )
}
