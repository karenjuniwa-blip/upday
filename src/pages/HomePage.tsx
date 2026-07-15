import { useState, useEffect } from 'react' // 🛠️ TAMBAHKAN: useEffect
import { useThemeStore }   from '@/stores/themeStore'
import { useAuthStore }    from '@/stores/authStore'
import { useTaskStore }    from '@/stores/taskStore'
import { useHabitStore }   from '@/stores/habitStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { useData }         from '@/hooks/useData'
import { useNow }          from '@/hooks/useNow'
import { NowNextCard }     from '@/components/home/NowNextCard'
import { PinnedHabits }    from '@/components/home/PinnedHabits'
import { TaskList }        from '@/components/home/TaskList'
import { TaskModal }       from '@/components/tasks/TaskModal'
import { DoneNoteModal }   from '@/components/habits/DoneNoteModal'
import { BriefingModal }   from '@/components/modals/BriefingModal'
import { ProgressRing, Spinner } from '@/components/ui/primitives'
import { DAYS_SHORT, MONTHS } from '@/lib/theme'
import { pad, toMin, nowStr, todayISO } from '@/utils'
import type { Task, Habit } from '@/types/database'
import type { NewTaskInput } from '@/stores/taskStore'

export function HomePage() {
 const { theme: C }                    = useThemeStore()
 const { user }                        = useAuthStore()
 const { tasks: allTasks, toggleTask, toggleSubtask, addTask, updateTask } = useTaskStore()
 const { habits, markDone, markUndone } = useHabitStore()
 const { events }                      = usePlannerStore()
 const { loading }                     = useData()
 const now                             = useNow()

 const [showAdd,      setShowAdd]      = useState(false)
 const [editTask,     setEditTask]     = useState<Task | null>(null)
 const [doneHabit,    setDoneHabit]    = useState<Habit | null>(null)
 const [showBriefing, setShowBriefing] = useState(true)

 // ── 🛠️ TAMBAHKAN: STATE UNTUK FITUR NOTE & HISTORY 7 HARI ──
 const today = todayISO()
 const [viewDate, setViewDate] = useState(today) // Tanggal catatan yang sedang dilihat
 const [notesData, setNotesData] = useState<Record<string, string>>(() => {
   // Ambil data catatan lama dari localStorage saat aplikasi pertama kali dimuat
   const saved = localStorage.getItem('daily_time_audit_notes')
   return saved ? JSON.parse(saved) : {}
 })

 // Pindahkan teks di textarea sesuai dengan tanggal yang sedang dipilih user
 const currentNoteValue = notesData[viewDate] ?? ''

 // Generate daftar 7 hari terakhir untuk menu history
 const last7Days = useMemo(() => {
   return Array.from({ length: 7 }, (_, i) => {
     const d = new Date()
     d.setDate(d.getDate() - i)
     const dateStr = d.toISOString().slice(0, 10)
     return {
       dateStr,
       dayNum: d.getDate(),
       dayLabel: DAYS_SHORT[d.getDay()],
       isToday: dateStr === today
     }
   }).reverse() // Urutkan dari yang paling lama ke hari ini
 }, [today])

 // Simpan setiap kali ada perubahan teks di catatan
 const handleNoteChange = (text: string) => {
   const updated = { ...notesData, [viewDate]: text }
   setNotesData(updated)
   localStorage.setItem('daily_time_audit_notes', JSON.stringify(updated))
 }
 // ──────────────────────────────────────────────────────────

 const nowMin  = toMin(nowStr(now))

 const activeTasks = allTasks.filter(t => {
   const isHariIni = t.date === today
   const belumSelesai = !t.done
   return isHariIni || belumSelesai
 })

 const done    = activeTasks.filter(t => t.done).length
 const pct     = activeTasks.length ? Math.round((done / activeTasks.length) * 100) : 0
 const greet   = now.getHours() < 12 ? 'Selamat pagi ☀️'
               : now.getHours() < 17 ? 'Selamat siang 🌤️'
               : 'Selamat malam 🌙'

 async function handleSaveTask(data: NewTaskInput) {
   if (!user) return
   if (editTask) {
     await updateTask(editTask.id, data)
   } else {
     await addTask(user.id, data)
   }
   setShowAdd(false)
   setEditTask(null)
 }

 async function handleDone(habit: Habit, note: string) {
   if (!user) return
   await markDone(habit.id, user.id, note)
   setDoneHabit(null)
 }

 if (loading) return <Spinner C={C} />

 return (
   <div style={{ paddingBottom: 24 }}>

     {/* ── Header ── */}
     <div style={{ padding: '20px 20px 0' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
         <div style={{ flex: 1, minWidth: 0 }}>
           <div style={{ fontSize: 12, color: C.muted, marginBottom: 2 }}>
             {DAYS_SHORT[now.getDay()]}, {now.getDate()} {MONTHS[now.getMonth()]} {now.getFullYear()}
           </div>
           <div style={{
             fontSize: 20, fontWeight: 700, color: C.text,
             whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
           }}>
             {greet}
           </div>
         </div>

         {/* Progress ring */}
         <div style={{ textAlign: 'center', position: 'relative', flexShrink: 0, marginLeft: 12 }}>
           <ProgressRing pct={pct} size={68} stroke={6} C={C} />
           <div style={{
             position: 'absolute', inset: 0,
             display: 'flex', flexDirection: 'column',
             alignItems: 'center', justifyContent: 'center',
           }}>
             <span style={{ fontSize: 14, fontWeight: 800, color: C.accent }}>{pct}%</span>
             <span style={{ fontSize: 9, color: C.muted }}>selesai</span>
           </div>
         </div>
       </div>

       {/* Now / Next */}
       <NowNextCard C={C} events={events} nowMin={nowMin} />
     </div>

     {/* ── Pinned habits ── */}
     <PinnedHabits
       C={C} habits={habits}
       onTapDone={h  => setDoneHabit(h)}
       onTapUndo={id => user && markUndone(id, user.id)}
     />

     {/* ── Task list ── */}
     <TaskList
       C={C} tasks={activeTasks}
       onToggle={id         => toggleTask(id)}
       onToggleSub={(tid, sid) => toggleSubtask(tid, sid)}
       onEdit={t  => setEditTask(t)}
       onAdd={() => setShowAdd(true)}
     />

     {/* ── 🛠️ TAMBAHKAN ELEMEN: TIME AUDIT NOTE DENGAN 7 HARI HISTORY ── */}
     <div style={{ padding: '24px 20px 0' }}>
       <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>
         🧠 EVALUASI WAKTU HARI INI
       </div>
       <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
         Sudah kamu manfaatkan buat apa saja energimu hari ini?
       </div>

       {/* Wadah Utama Box Catatan */}
       <div style={{
         background: C.card, borderRadius: 14, padding: 14,
         border: `1px solid ${C.border}`, boxShadow: C.shadow
       }}>
         {/* Row Tab Kapsul Riwayat 7 Hari */}
         <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
           {last7Days.map(d => {
             const isSelected = d.dateStr === viewDate
             return (
               <button
                 key={d.dateStr}
                 onClick={() => setViewDate(d.dateStr)}
                 style={{
                   flex: 1, minWidth: 42, padding: '6px 0', borderRadius: 10,
                   background: isSelected ? C.accent : 'transparent',
                   border: `1px solid ${isSelected ? C.accent : C.border}`,
                   color: isSelected ? C.bg : C.text,
                   cursor: 'pointer', display: 'flex', flexDirection: 'column',
                   alignItems: 'center', transition: 'all .15s'
                 }}
               >
                 <span style={{ fontSize: 9, opacity: isSelected ? 0.9 : 0.6, fontWeight: 600 }}>{d.dayLabel}</span>
                 <span style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{d.dayNum}</span>
               </button>
             )
           })}
         </div>

         {/* Kolom Ketik Catatan */}
         <textarea
           value={currentNoteValue}
           onChange={e => handleNoteChange(e.target.value)}
           placeholder={viewDate === today ? "Tulis pemanfaatan waktumu hari ini di sini..." : "Tidak ada catatan pada tanggal ini."}
           disabled={viewDate !== today} // 🔒 Catatan hari lalu dikunci (Read-Only) agar fokus evaluasi murni
           style={{
             width: '100%', minHeight: 90, background: C.surface,
             color: C.text, border: `1px solid ${C.border}`, borderRadius: 10,
             padding: 10, fontSize: 13, outline: 'none', resize: 'none',
             boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: '1.5',
             opacity: viewDate === today ? 1 : 0.8
           }}
         />

         {/* Status Penanda Hari yang sedang Dilihat */}
         <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: C.muted }}>
           <span>{viewDate === today ? '✍️ Menulis Jurnal Hari Ini' : '📋 Melihat Riwayat Masa Lalu'}</span>
           <span style={{ fontWeight: 600 }}>{viewDate}</span>
         </div>
       </div>
     </div>
     {/* ────────────────────────────────────────────────────────────────── */}

     {/* ── Modals ── */}
     {(showAdd || editTask) && (
       <TaskModal
         C={C}
         initial={editTask}
         onClose={() => { setShowAdd(false); setEditTask(null) }}
         onSave={handleSaveTask}
       />
     )}

     {doneHabit && (
       <DoneNoteModal
         C={C} habit={doneHabit}
         onClose={() => setDoneHabit(null)}
         onConfirm={note => handleDone(doneHabit, note)}
       />
     )}

     {showBriefing && (
       <BriefingModal
         C={C} tasks={activeTasks} habits={habits}
         events={events} nowMin={nowMin}
         onClose={() => setShowBriefing(false)}
       />
     )}
   </div>
 )
}