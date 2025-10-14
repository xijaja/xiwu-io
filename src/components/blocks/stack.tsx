export default function Stack() {
  return (
    <section>
      <h2 className="text-2xl font-roboto-mono font-bold mb-8">Stack_</h2>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-[#E34F26] rounded-sm flex items-center justify-center text-white text-xs font-bold">
            5
          </div>
          <span>HTML5</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-[#1572B6] rounded-sm flex items-center justify-center text-white text-xs font-bold">
            3
          </div>
          <span>CSS3</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-[#F7DF1E] rounded-sm flex items-center justify-center text-black text-xs font-bold">
            JS
          </div>
          <span>JavaScript</span>
        </div>
      </div>
    </section>
  );
}
