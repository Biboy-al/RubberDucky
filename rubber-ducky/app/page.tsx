import { VideoRecorder} from "@/components/video-recorder"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="flex items-center justify-center p-4 relative overflow-hidden min-h-[calc(100vh-4rem)]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="w-full max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-800/60 backdrop-blur-md text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-slate-700/50 shadow-lg shadow-blue-500/10">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              AI-Powered Feedback
            </div>
            <h1 className="text-6xl font-bold text-white mb-6 text-balance bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Rubber Ducky
            </h1>
            <p className="text-slate-300 text-xl  max-w-2xl mx-auto">
              Record yourself speaking or presenting and receive instant AI-powered feedback on your delivery, body
              language, and communication skills
            </p>
          </div>
          <VideoRecorder/>
        </div>
      </main>
    </div>
  )
}
