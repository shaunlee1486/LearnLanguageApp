import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 text-white">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/60 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            YK Language Learn
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-emerald-400 transition-colors">Tính năng</a>
          <a href="#languages" className="hover:text-emerald-400 transition-colors">Ngôn ngữ</a>
          <a href="#about" className="hover:text-emerald-400 transition-colors">Về chúng tôi</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold hover:text-emerald-400 transition-colors px-4 py-2"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            Đăng ký miễn phí
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-6 py-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-6">
          ✨ Hệ thống học ngoại ngữ thông minh thế hệ mới
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Làm chủ ngoại ngữ với{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Phương Pháp Khoa Học
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mb-10 leading-relaxed">
          Ghi nhớ từ vựng qua Flashcard, luyện tập trắc nghiệm phản xạ nhanh, học ngữ pháp theo cấu trúc câu và thực hành nét vẽ bộ thủ tiếng Trung/Nhật chuẩn xác nhất.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/register"
            className="px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            Bắt đầu học ngay
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <a
            href="#features"
            className="px-8 py-4 rounded-xl text-lg font-semibold border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center"
          >
            Khám phá tính năng
          </a>
        </div>

        {/* Floating statistics or language highlights */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16 max-w-3xl w-full border-t border-white/10 pt-12">
          <div>
            <div className="text-2xl md:text-4xl font-bold text-emerald-400">English</div>
            <div className="text-xs md:text-sm text-slate-400 mt-1">Tiếng Anh Giao Tiếp</div>
          </div>
          <div>
            <div className="text-2xl md:text-4xl font-bold text-teal-400">中文</div>
            <div className="text-xs md:text-sm text-slate-400 mt-1">Tiếng Trung & Bộ Thủ</div>
          </div>
          <div>
            <div className="text-2xl md:text-4xl font-bold text-cyan-400">日本語</div>
            <div className="text-xs md:text-sm text-slate-400 mt-1">Tiếng Nhật & Kanji</div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 bg-slate-950/40 border-t border-b border-white/5 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Phương Pháp Học Tập Toàn Diện</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Được thiết kế dựa trên các nguyên tắc khoa học về trí nhớ, giúp bạn tiếp thu kiến thức một cách tự nhiên và bền vững.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-8 hover:border-emerald-500/30 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                📚
              </div>
              <h3 className="text-xl font-bold mb-3">Ôn Tập Từ Vựng Đa Chế Độ</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Tự do chuyển đổi linh hoạt giữa 3 chế độ ôn tập: Flashcard trực quan, Câu hỏi trắc nghiệm phản xạ, và Tự gõ đáp án để ghi nhớ sâu sắc nhất.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-8 hover:border-teal-500/30 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                ✍️
              </div>
              <h3 className="text-xl font-bold mb-3">Tập Viết Bộ Thủ Chữ Hán</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Tích hợp Canvas vẽ thông minh cảm ứng, hướng dẫn bạn từng nét vẽ theo đúng quy tắc bút thuận của 214 bộ thủ chữ Hán.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-8 hover:border-cyan-500/30 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                📈
              </div>
              <h3 className="text-xl font-bold mb-3">Báo Cáo & Phân Tích Tiến Độ</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Theo dõi sát sao thời gian học tập mỗi ngày, sự thay đổi trạng thái từ vựng và lịch sử điểm số bài thi thông qua biểu đồ trực quan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/80 px-6 py-8 text-center text-slate-500 text-sm">
        <p>© 2026 YK Language Learn. Tất cả các quyền được bảo lưu.</p>
      </footer>
    </div>
  );
}
