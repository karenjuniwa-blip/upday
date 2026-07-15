import { useState, useMemo } from 'react'
import { useThemeStore }  from '@/stores/themeStore'
import { useAuthStore }   from '@/stores/authStore'
import { useHabitStore }  from '@/stores/habitStore'
import { useData }        from '@/hooks/useData'
import { AddHabitModal }  from '@/components/habits/AddHabitModal'
import { DoneNoteModal }  from '@/components/habits/DoneNoteModal'
import { HabitDetailModal } from '@/components/habits/HabitDetailModal'
import { Spinner, EmptyState } from '@/components/ui/primitives'
import { todayISO } from '@/utils'
import type { Habit } from '@/types/database'
import type { NewHabitInput } from '@/stores/habitStore'

export function HabitsPage() {
 const { theme: C }                                          = useThemeStore()
 const { user }                                             = useAuthStore()
 const { habits, addHabit, updateHabit, deleteHabit, markDone, markUndone, togglePin } = useHabitStore()
 const { loading }                                          = useData()

 const [showAdd,    setShowAdd]    = useState(false)
 const [editHabit,  setEditHabit]  = useState<Habit | null>(null)
 const [detailHabit,setDetailHabit]= useState<Habit | null>(null)
 const [doneHabit,  setDoneHabit]  = useState<Habit | null>(null)

 // State untuk navigasi bulan pada riwayat kalender konsistensi
 const [currentCalendarDate, setCurrentCalendarDate] = useState(() => new Date())

 const today    = todayISO()
 const doneCount = habits.filter(h => h.logs.find(l => l.log_date === today)?.done).length

 // 🛠️ PERBAIKAN NO 2: Reset state modal secara otomatis setelah proses save sukses
 async function handleSave(data: NewHabitInput) {
   if (!user) return
   if (editHabit) {
     await updateHabit(editHabit.id, data)
   } else {
     await addHabit(user.id, data)
   }
   setShowAdd(false)
   setEditHabit(null)
 }

 // Fungsi hapus langsung yang akan di-passing ke AddHabitModal saat mode edit
 async function handleDelete(id: string) {
   if (confirm("Apakah kamu yakin ingin menghapus habit ini?")) {
     await deleteHabit(id)
     setEditHabit(null)
   }
 }

 async function handleDone(habit: Habit, note: string) {
   if (!user) return
   await markDone(habit.id, user.id, note)
   setDoneHabit(null)
 }

 async function handleUndo(id: string) {
   if (!user) return
   await markUndone(id, user.id)
 }

 // 🛠️ PERBAIKAN NO 1 & FITUR BULANAN: Optimasi kalkulasi grid data kalender menggunakan useMemo
 const calendarData = useMemo(() => {
   const year = currentCalendarDate.getFullYear()
   const month = currentCalendarDate.getMonth()
   
   // Dapatkan jumlah hari dalam bulan terpilih
   const daysInMonth = new Date(year, month + 1, 0).getDate()
   const totalHabits = habits.length

   return Array.from({ length: daysInMonth }, (_, i) => {
     const dayNum = i + 1
     // Format date string menjadi YYYY-MM-DD local time
     const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
     
     const done = habits.filter(h => h.logs.find(l => l.log_date === dateStr)?.done).length
     const ratio = totalHabits ? done / totalHabits : 0
     
     // Penentuan warna background berdasarkan rasio keberhasilan habit
     const bg = ratio > .7 ? C.primary : ratio > .3 ? `${C.primary}66` : C.isDark ? C.card : C.border

     return { dayNum, bg, dateStr }
   })
 }, [currentCalendarDate, habits, C])

 // Fungsi navigasi bulan
 const changeMonth = (direction: number) => {
   setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1))
 }

 const monthName = currentCalendarDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })

 if (loading) return <Spinner C={C} />

 return (
   <div style={{ padding: '20px 20px 24px' }}>

     {/* ── Header ── */}
     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
       <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Habit Tracker</div>
       <button onClick={() => setShowAdd(true)} className="tap-highlight" style={{
         fontSize: 12, fontWeight: 700, color: C.accent,
         background: 'transparent', border: `1px solid ${C.accent}`,
         borderRadius: 99, padding: '6px 14px', cursor: 'pointer',
       }}>
         + Habit Baru
       </button>
     </div>
     <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
       {doneCount}/{habits.length} selesai hari ini
     </div>

     {/* ── Kalender Konsistensi Bulanan (Full Month) ── */}
     <div style={{
       background: C.surface, borderRadius: 14, padding: 14,
       border: `1px solid ${C.border}`, marginBottom: 20, boxShadow: C.shadow,
     }}>
       {/* Navigasi Riwayat Bulan */}
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
         <div style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>
           Konsistensi: <span style={{ color: C.text }}>{monthName}</span>
         </div>
         <div style={{ display: 'flex', gap: 8 }}>
           <button onClick={() => changeMonth(-1)} style={{ background: 'transparent', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}>◀</button>
           <button onClick={() => changeMonth(1)} style={{ background: 'transparent', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}>▶</button>
         </div>
       </div>

       {/* Grid Kalender Sebulan Penuh */}
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
         {calendarData.map((day) => (
           <div 
             key={day.dateStr} 
             title={`${day.dateStr}`}
             style={{ 
               aspectRatio: '1', 
               borderRadius: 6, 
               background: day.bg, 
               transition: 'background .3s',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: 10,
               fontWeight: 600,
               color: C.isDark ? '#fff' : '#000',
               opacity: 0.9,
               border: day.dateStr === today ? `2px solid ${C.accent}` : 'none'
             }}
           >
             {day.dayNum}
           </div>
         ))}
       </div>
     </div>

     {/* ── Habit list ── */}
     {habits.length === 0 ? (
       <EmptyState
         C={C} icon="🔥"
         title="Belum ada habit"
         subtitle="Tambahkan kebiasaan pertamamu!"
       />
     ) : (
       <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
         {habits.map(h => {
           const done = h.logs.find(l => l.log_date === today)?.done ?? false
           return (
             <div key={h.id} style={{
               background: C.card, borderRadius: 16,
               border: `1.5px solid ${done ? h.color + '55' : C.border}`,
               padding: '14px 14px', transition: 'all .2s', boxShadow: C.shadow,
             }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

                 {/* Done toggle */}
                 <button
                   onClick={() => done ? handleUndo(h.id) : setDoneHabit(h)}
                   className="tap-highlight"
                   style={{
                     width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                     border: `2px solid ${done ? h.color : C.border}`,
                     background: done ? `${h.color}33` : C.surface,
                     cursor: 'pointer', fontSize: 24, transition: 'all .2s',
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                   }}
                 >
                   {done ? '✅' : h.icon}
                 </button>

                 {/* Info — tap to open detail */}
                 <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setDetailHabit(h)}>
                   <div style={{
                     fontSize: 14, fontWeight: 700,
                     color: done ? h.color : C.text,
                     overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                   }}>
                     {h.title}
                   </div>
                   <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                     🔥 {h.streak} hari streak · ⏰ {h.time}
                   </div>
                   {/* Streak bar */}
                   <div style={{ marginTop: 6, height: 4, borderRadius: 99, background: C.surface, overflow: 'hidden' }}>
                     <div style={{
                       height: '100%', borderRadius: 99, background: h.color,
                       width: `${Math.min(100, (h.streak / 30) * 100)}%`,
                       transition: 'width .4s',
                     }} />
                   </div>
                 </div>

                 {/* Action buttons */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                   <button onClick={() => togglePin(h.id)} style={{
                     background: 'transparent', border: 'none',
                     cursor: 'pointer', fontSize: 16,
                     opacity: h.pinned ? 1 : .3, transition: 'opacity .2s',
                   }}>📌</button>
                   <button onClick={() => setEditHabit(h)} style={{
                     background: 'transparent', border: 'none',
                     cursor: 'pointer', fontSize: 14, opacity: .6,
                   }}>✏️</button>
                   <button onClick={() => setDetailHabit(h)} style={{
                     background: 'transparent', border: 'none',
                     cursor: 'pointer', fontSize: 14, opacity: .6,
                   }}>📊</button>
                 </div>
               </div>

               {/* Streak freeze indicator */}
               {h.freezes_left > 0 && (
                 <div style={{
                   marginTop: 10, paddingTop: 10,
                   borderTop: `1px solid ${C.border}`,
                   display: 'flex', alignItems: 'center', gap: 6,
                 }}>
                   <span style={{ fontSize: 11, color: C.muted }}>
                     ❄️ {h.freezes_left}x streak freeze tersisa
                   </span>
                 </div>
               )}
             </div>
           )
         })}
       </div>
     )}

     {/* ── Modals ── */}
     {(showAdd || editHabit) && (
       <AddHabitModal
         C={C} 
         initial={editHabit}
         onClose={() => { setShowAdd(false); setEditHabit(null) }}
         onSave={handleSave}
         onDelete={editHabit ? () => handleDelete(editHabit.id) : undefined} // 🛠️ Diteruskan ke modal jika modenya edit
       />
     )}
     {detailHabit && (
       <HabitDetailModal
         C={C}
         habit={habits.find(h => h.id === detailHabit.id) ?? detailHabit}
         onClose={() => setDetailHabit(null)}
       />
     )}
     {doneHabit && (
       <DoneNoteModal
         C={C} habit={doneHabit}
         onClose={() => setDoneHabit(null)}
         onConfirm={note => handleDone(doneHabit, note)}
       />
     )}
   </div>
 )
}