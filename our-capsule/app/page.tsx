"use client"
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

// --- Supabase Config ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const MY_ID = "1264833597240643605"
const PARTNER_ID = "1208020426333102131"

// --- UI Components ---
// Moved outside to prevent re-creation on every render
const StatusCard = ({ 
  user, 
  id, 
  instanceKey, 
  expandedId, 
  setExpandedId 
}: { 
  user: any, 
  id: string, 
  instanceKey: string, 
  expandedId: string | null, 
  setExpandedId: (id: string | null) => void 
}) => {
  if (!user || !user.discord_user) return null
  const isExpanded = expandedId === instanceKey
  const activities = user.activities?.filter((a: any) => a.type !== 4 && a.name !== "Spotify") || []
  const spotify = user.spotify
  const statusColors: any = { online: 'bg-green-500', dnd: 'bg-red-500', idle: 'bg-yellow-500', offline: 'bg-gray-500' }

  return (
    <div
      onClick={(e) => { 
        e.stopPropagation(); 
        setExpandedId(isExpanded ? null : instanceKey); 
      }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer bg-white/50 border border-white/80 rounded-[2.2rem] overflow-hidden mb-4 shadow-sm w-full active:scale-[0.98] select-none
        ${isExpanded ? 'p-6 bg-white shadow-md' : 'p-3 hover:bg-white/60'}`}
    >
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <img
            src={`https://cdn.discordapp.com/avatars/${id}/${user.discord_user.avatar}.png`}
            className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-[1.2rem] border-2 border-white object-cover ${isExpanded ? 'w-14 h-14' : 'w-10 h-10'}`}
            alt="pfp"
          />
          <div className={`absolute -bottom-1 -right-1 rounded-full border-[3px] border-white transition-all duration-700 ${statusColors[user.discord_status] || 'bg-gray-500'} ${isExpanded ? 'w-5 h-5' : 'w-4 h-4'}`} />
        </div>
        <div className="overflow-visible flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-black text-[#cc8292] uppercase tracking-tighter italic leading-none transition-all duration-700 ${isExpanded ? 'text-xl mb-1' : 'text-sm'}`}>
              {user.discord_user.global_name || user.discord_user.username}
            </h3>
            {!isExpanded && <span className="text-[8px] font-black text-[#cc8292]/30 uppercase italic tracking-widest">Tap</span>}
          </div>
        </div>
      </div>
      <div className={`grid transition-[grid-template-rows,opacity,margin] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
        <div className="overflow-hidden">
          <div className="space-y-3 pb-1">
            {activities.length === 0 && !spotify && (
              <p className="text-[10px] font-bold text-[#cc8292]/40 italic uppercase text-center py-2">Chilling</p>
            )}
            {activities.map((act: any, i: number) => (
              <div key={i} className="p-4 rounded-2xl bg-white/60 border border-white/80 flex flex-col gap-1 shadow-inner">
                <p className="text-[8px] font-black text-[#cc8292]/40 uppercase tracking-widest">Playing</p>
                <p className="text-[11px] font-black text-[#cc8292] uppercase italic">{act.name}</p>
              </div>
            ))}
            {spotify && (
              <div className="bg-[#1DB954]/5 p-4 rounded-2xl border border-[#1DB954]/20 flex items-center gap-4 shadow-inner">
                <img src={spotify.album_art_url} className="w-12 h-12 rounded-xl shadow-sm" alt="spotify" />
                <div className="text-left overflow-hidden">
                  <p className="text-[8px] font-black text-[#1DB954] uppercase tracking-widest mb-1">Listening to</p>
                  <p className="text-[11px] font-black text-[#1DB954] uppercase tracking-tight truncate">{spotify.song}</p>
                  <p className="text-[9px] font-bold text-[#1DB954]/60 italic uppercase truncate">{spotify.artist}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MegaCapsule() {
  // --- Auth & Navigation ---
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [passError, setPassError] = useState(false)
  const [view, setView] = useState('Home')

  // --- Content Data ---
  const [messages, setMessages] = useState<any[]>([])
  const [voicemails, setVoicemails] = useState<any[]>([])
  const [folders, setFolders] = useState<any[]>([])
  const [currentFolder, setCurrentFolder] = useState<any>(null)
  const [folderImages, setFolderImages] = useState<any[]>([])
  
  // --- UI & Interaction ---
  const [input, setInput] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [timeSince, setTimeSince] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [myStatus, setMyStatus] = useState<any>(null)
  const [partnerStatus, setPartnerStatus] = useState<any>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<any>(null)

  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  // --- Login ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordInput.toLowerCase() === "maurain") {
      setIsAuthenticated(true)
    } else {
      setPassError(true)
      setTimeout(() => setPassError(false), 500)
    }
  }

  // --- Data Sync ---
  const refreshData = async () => {
    const { data: msg } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    if (msg) setMessages(msg)
    
    const { data: vm } = await supabase.from('voicemails').select('*').order('created_at', { ascending: false })
    if (vm) setVoicemails(vm)
    
    const { data: fld } = await supabase.from('folders').select('*').order('created_at', { ascending: false })
    if (fld) setFolders(fld)
  }

  const fetchFolderImages = async (folderId: string) => {
    const { data } = await supabase.from('images').select('*').eq('folder_id', folderId).order('created_at', { ascending: false })
    if (data) setFolderImages(data)
  }

  // --- Lanyard Status ---
  useEffect(() => {
    if (!isAuthenticated) return
    const fetchStatus = async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`https://api.lanyard.rest/v1/users/${MY_ID}`).then(r => r.json()),
          fetch(`https://api.lanyard.rest/v1/users/${PARTNER_ID}`).then(r => r.json())
        ])
        if(res1.success) setMyStatus(res1.data)
        if(res2.success) setPartnerStatus(res2.data)
      } catch (e) { console.error(e) }
    }
    fetchStatus(); const interval = setInterval(fetchStatus, 15000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  // --- Relationship Timer ---
  useEffect(() => {
    const startDate = new Date("January 28, 2026 00:00:00").getTime()
    const interval = setInterval(() => {
      const d = new Date().getTime() - startDate
      setTimeSince(`${Math.floor(d/86400000)}d ${Math.floor((d%86400000)/3600000)}h ${Math.floor((d%3600000)/60000)}m ${Math.floor((d%60000)/1000)}s`)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => { if (isAuthenticated) refreshData() }, [isAuthenticated])

  // --- Folder & Media Actions ---
  const createFolder = async () => {
    if (!newFolderName) return
    await supabase.from('folders').insert([{ name: newFolderName }])
    setNewFolderName("")
    refreshData()
  }

  const uploadImage = async (e: any) => {
    const file = e.target.files[0]
    if (!file || !currentFolder) return
    const fileName = `${currentFolder.id}/${Date.now()}-${file.name}`
    
    const { data } = await supabase.storage.from('gallery').upload(fileName, file)
    if (data) {
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName)
      await supabase.from('images').insert([{ url: publicUrl, folder_id: currentFolder.id }])
      fetchFolderImages(currentFolder.id)
    }
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename || 'memory.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) { console.error("Download failed", err) }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder.current?.stop()
      setIsRecording(false)
      return
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.current = new MediaRecorder(stream)
    audioChunks.current = []
    mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data)
    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
      const fileName = `${Date.now()}.webm`
      const { data } = await supabase.storage.from('voicemails').upload(fileName, audioBlob)
      if (data) {
        const { data: { publicUrl } } = supabase.storage.from('voicemails').getPublicUrl(fileName)
        await supabase.from('voicemails').insert([{ url: publicUrl }])
        refreshData()
      }
    }
    mediaRecorder.current.start()
    setIsRecording(true)
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f3d0d7] flex items-center justify-center p-6">
        <div className={`w-full max-w-md p-10 bg-white/60 rounded-[3rem] border border-white shadow-xl backdrop-blur-md transition-all duration-300 ${passError ? 'animate-bounce border-red-300' : ''}`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#cc8292]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cc8292" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.6em] text-[#cc8292] italic">Secure Entry</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Enter Password..." className="w-full bg-white/50 border border-white p-6 rounded-[2rem] outline-none text-center font-bold text-[#cc8292] placeholder-[#cc8292]/30 focus:bg-white transition-all shadow-inner" autoFocus />
            <button type="submit" className="w-full bg-[#cc8292] text-white p-5 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all">Unlock Capsule</button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative text-[#8a5d68] bg-[#f3d0d7]" onClick={() => setExpandedId(null)}>
      
      {/* --- Image Lightbox --- */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-[#f3d0d7]/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300" onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl w-full flex flex-col items-center gap-6" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full flex justify-center">
              <img src={selectedImage.url} className="max-h-[70vh] rounded-[3rem] shadow-2xl border-8 border-white object-contain" alt="Full preview" />
              <button onClick={() => setSelectedImage(null)} className="absolute -top-4 -right-4 bg-white text-[#cc8292] w-12 h-12 rounded-full font-black shadow-xl hover:scale-110 border border-[#f3d0d7]">✕</button>
            </div>
            <div className="flex gap-4">
               <button onClick={() => handleDownload(selectedImage.url, `memory-${selectedImage.id}.jpg`)} className="bg-[#cc8292] text-white px-10 py-5 rounded-full font-black uppercase text-[11px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download
              </button>
              <button onClick={() => setSelectedImage(null)} className="bg-white/80 text-[#cc8292] px-10 py-5 rounded-full font-black uppercase text-[11px] tracking-widest shadow-md hover:bg-white transition-all active:scale-95">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Menu & Nav */}
      <button onClick={() => setIsMenuOpen(true)} className="fixed top-6 left-6 z-50 text-[#cc8292] bg-white/60 p-3 rounded-full shadow-md border border-white hover:scale-110 active:scale-90 transition-all">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      <div className={`fixed inset-0 bg-black/5 backdrop-blur-[2px] z-40 transition-opacity duration-1000 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)} />
      
      <div className={`fixed top-0 left-0 h-full w-[320px] sm:w-[380px] bg-white/90 backdrop-blur-xl z-50 p-8 sm:p-10 shadow-2xl transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-r-[3rem] sm:rounded-r-[4rem] border-r border-white/50 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setIsMenuOpen(false)} className="self-end text-[#cc8292] font-black mb-8 text-[10px] tracking-[0.4em] uppercase italic opacity-50">✕ Close</button>
        <nav className="flex flex-col gap-4 mb-8">
            {['Home', 'Voicemails', 'Gallery'].map(item => (
                <button key={item} onClick={() => {setView(item); setIsMenuOpen(false); setCurrentFolder(null)}} className={`group p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.2rem] border transition-all duration-1000 flex flex-col items-start active:scale-95 ${view === item ? 'bg-white border-white shadow-md translate-x-2' : 'bg-white/20 border-white/40'}`}>
                    <span className={`text-3xl sm:text-4xl font-black uppercase italic tracking-tighter transition-colors duration-1000 ${view === item ? 'text-[#cc8292]' : 'text-[#cc8292]/30'}`}>{item}</span>
                </button>
            ))}
        </nav>
        <div className="mt-auto overflow-y-auto pr-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-[#cc8292]/30 mb-6 italic">Pulse Check</h4>
            <StatusCard user={myStatus} id={MY_ID} instanceKey="user-1" expandedId={expandedId} setExpandedId={setExpandedId} />
            <StatusCard user={partnerStatus} id={PARTNER_ID} instanceKey="user-2" expandedId={expandedId} setExpandedId={setExpandedId} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 pt-24 pb-12 relative z-10">
        
        {/* VIEW: HOME */}
        {view === 'Home' && (
          <div className="max-w-2xl mx-auto space-y-8 sm:space-y-10">
            <div className="text-center py-12 sm:py-20 bg-white/60 rounded-[3rem] sm:rounded-[4rem] border border-white shadow-sm"><div className="text-3xl sm:text-7xl font-black text-[#cc8292] italic font-mono tracking-tighter tabular-nums break-words px-4">{timeSince}</div></div>
            <div className="bg-white/70 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] border border-white shadow-sm">
                <textarea className="w-full bg-transparent p-2 outline-none text-xl sm:text-2xl font-bold placeholder-[#cc8292]/20 resize-none" placeholder="Recent thoughts..." rows={2} value={input} onChange={(e) => setInput(e.target.value)} />
                <div className="flex justify-end mt-4 sm:mt-6"><button onClick={async () => { if(!input) return; await supabase.from('posts').insert([{ text: input }]); setInput(""); refreshData() }} className="bg-[#cc8292] text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-black uppercase text-[10px] sm:text-[11px] tracking-[0.2em] shadow-md active:scale-95 transition-all">Send Post</button></div>
            </div>
            <div className="flex flex-col gap-6">
              {messages.map((m, i) => (
                <div key={i} className="p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] bg-white/50 border border-white shadow-sm animate-in slide-in-from-bottom-4 overflow-hidden">
                  <p className="text-xl sm:text-2xl font-bold text-[#8a5d68] leading-tight break-words whitespace-pre-wrap">{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: GALLERY */}
        {view === 'Gallery' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            {!currentFolder ? (
              <>
                <div className="bg-white/70 p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] border border-white shadow-sm flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                  <input className="flex-1 bg-transparent px-4 sm:px-6 outline-none text-lg font-bold placeholder-[#cc8292]/30" placeholder="New Folder Name..." value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
                  <button onClick={createFolder} className="bg-[#cc8292] text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all">Add Folder</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  {folders.map((f) => (
                    <button key={f.id} onClick={() => { setCurrentFolder(f); fetchFolderImages(f.id); }} className="group bg-white/50 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-white flex flex-col items-center gap-4 active:scale-95 transition-all shadow-sm">
                      <div className="text-4xl sm:text-5xl">📂</div>
                      <span className="font-black text-[#cc8292] uppercase italic text-[11px] sm:text-[12px] tracking-tighter text-center">{f.name}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between bg-white/70 p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-white shadow-sm">
                  <button onClick={() => setCurrentFolder(null)} className="text-[10px] font-black uppercase tracking-widest text-[#cc8292]/60 hover:text-[#cc8292]">← Back</button>
                  <h2 className="font-black text-[#cc8292] uppercase italic tracking-tighter text-lg sm:text-xl truncate px-2">{currentFolder.name}</h2>
                  <label className="cursor-pointer bg-[#cc8292] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-black uppercase text-[9px] tracking-widest shadow-md active:scale-95 transition-all">
                    Upload
                    <input type="file" hidden accept="image/*" onChange={uploadImage} />
                  </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {folderImages.map((img, i) => (
                    <div key={i} onClick={() => setSelectedImage(img)} className="aspect-square rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-4 border-white shadow-md bg-white/40 active:scale-95 transition-all cursor-pointer">
                      <img src={img.url} className="w-full h-full object-cover" alt="gallery-item" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: VOICEMAILS */}
        {view === 'Voicemails' && (
          <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="bg-white/70 p-10 sm:p-12 rounded-[3rem] sm:rounded-[4rem] border border-white shadow-sm text-center">
                <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-[#cc8292] mb-8 italic">Voicemail Hub</h2>
                <button onClick={toggleRecording} className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 transition-all duration-500 flex items-center justify-center mx-auto ${isRecording ? 'bg-red-500 border-red-200 scale-110 animate-pulse' : 'bg-[#cc8292] border-white shadow-lg active:scale-90'}`}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                </button>
                <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-[#cc8292]/40 italic">{isRecording ? "Stop & Save" : "Record a Note"}</p>
            </div>
            <div className="space-y-4">
              {voicemails.map((v, i) => (
                <div key={i} className="bg-white/50 p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-white flex flex-col sm:flex-row items-center gap-4 shadow-sm animate-in zoom-in-95">
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-black text-[#cc8292] uppercase italic">Note {voicemails.length - i}</p>
                    <p className="text-[8px] font-bold opacity-30 uppercase">{new Date(v.created_at).toLocaleString()}</p>
                  </div>
                  <audio src={v.url} controls className="h-8 opacity-60 w-full" />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
