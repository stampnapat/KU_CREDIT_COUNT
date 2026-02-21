import React, { useEffect, useMemo, useState } from "react";
import { MYSQL_API } from "../config";
import { GraduationCap, Leaf, PieChart } from "lucide-react";

type Summary = {
  totalCourses: number;
  totalCredits: number;
  byCategory: Record<string, { courses: number; credits: number }>;
};

const TOTAL_REQUIRED_CREDITS = 120;

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string>("");

  // ✅ Add Course states (ต้องอยู่บนสุดของ component)
  const [form, setForm] = useState({
    code: "",
    name: "",
    category: "Major",
    credits: 3,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  // โหลด summary ตอนเปิดหน้า
  useEffect(() => {
    fetch(`${MYSQL_API}/api/curriculum-progress`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setSummary(data))
      .catch((e) => setError(String(e)));
  }, []);

  async function refreshSummary() {
    const res = await fetch(`${MYSQL_API}/api/curriculum-progress`);
    const data = await res.json();
    setSummary(data);
  }

  async function handleAddCourse(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setSaving(true);

    try {
      const res = await fetch(`${MYSQL_API}/api/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim(),
          name: form.name.trim(),
          category: form.category,
          credits: Number(form.credits),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Add course failed: HTTP ${res.status} ${text}`);
      }

      setMsg("✅ เพิ่มวิชาเรียบร้อย");
      setForm({ code: "", name: "", category: "Major", credits: 3 });

      // รีเฟรช summary
      await refreshSummary();
    } catch (err: any) {
      setMsg(`❌ ${err?.message ?? String(err)}`);
    } finally {
      setSaving(false);
    }
  }

  const progress = useMemo(() => {
    const credits = summary?.totalCredits ?? 0;
    const percent = Math.min(100, Math.round((credits / TOTAL_REQUIRED_CREDITS) * 100));
    const remaining = Math.max(0, TOTAL_REQUIRED_CREDITS - credits);
    return { credits, percent, remaining };
  }, [summary]);

  // error view
  if (error) {
    return (
      <div className="container">
        <div className="card">
          <h2>เกิดข้อผิดพลาด</h2>
          <div className="small">{error}</div>
          <div className="small">เช็คว่า MySQL API เปิดอยู่ที่ {MYSQL_API} และ CORS เปิดแล้ว</div>
        </div>
      </div>
    );
  }

  // loading view
  if (!summary) {
    return (
      <div className="container">
        <div className="card">
          <h2>Loading...</h2>
          <div className="small">กำลังดึงข้อมูลจากระบบ</div>
        </div>
      </div>
    );
  }

  const categories = Object.entries(summary.byCategory ?? {}).sort(
    (a, b) => (b[1].credits ?? 0) - (a[1].credits ?? 0)
  );

  return (
    <div className="container">
      <div className="header">
        <div className="brand">
          <Leaf size={28} />
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>
              KU Credit System
            </div>
            <div className="small">Dashboard สรุปหน่วยกิต (Demo)</div>
          </div>
        </div>
        <div className="badge">MySQL API: {MYSQL_API}</div>
      </div>

      <div className="grid">
        {/* LEFT */}
        <div className="card">
          <h2>Progress to Graduation</h2>

          <div className="kpi">
            <div className="kpiBox">
              <div className="kpiValue">{summary.totalCredits}</div>
              <div className="kpiLabel">Total Credits (สะสม)</div>
            </div>
            <div className="kpiBox">
              <div className="kpiValue">{summary.totalCourses}</div>
              <div className="kpiLabel">Total Courses (วิชาที่มีข้อมูล)</div>
            </div>
          </div>

          <div className="progressWrap">
            <div className="progressRow">
              <span>
                {progress.credits} / {TOTAL_REQUIRED_CREDITS} credits
              </span>
              <span>{progress.percent}%</span>
            </div>

            <div className="progressBar" aria-label="progress bar">
              <div className="progressFill" style={{ width: `${progress.percent}%` }} />
            </div>

            <div className="small" style={{ marginTop: 10 }}>
              เหลืออีกประมาณ <b>{progress.remaining}</b> หน่วยกิตเพื่อครบ {TOTAL_REQUIRED_CREDITS} หน่วยกิต (สมมติ)
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="card">
          <h2>Quick Summary</h2>
          <div className="small" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <GraduationCap size={18} />
            ระบบนี้เป็นเดโมเพื่อแสดงการใช้งานฐานข้อมูล + การคำนวณสรุปผล
          </div>
          <div className="small" style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
            <PieChart size={18} />
            แยกตามหมวด (Core / Major / Free ฯลฯ) จากข้อมูลใน MySQL
          </div>

          <div className="small" style={{ marginTop: 14 }}>
            Tip: เพิ่มวิชาหรือแก้ credits แล้วกลับมาหน้านี้ จะเห็น progress เปลี่ยนทันที
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="card">
        <h2>Credits by Category</h2>
        <div className="pills">
          {categories.length === 0 ? (
            <div className="small">ยังไม่มีข้อมูลหมวดหมู่</div>
          ) : (
            categories.map(([name, v]) => (
              <div className="pill" key={name}>
                <div className="pillTop">
                  <div className="pillName">{name}</div>
                  <div className="pillMeta">{v.courses} courses</div>
                </div>

                <div style={{ fontSize: 24, fontWeight: 900 }}>{v.credits} credits</div>

                <div className="progressWrap" style={{ marginTop: 10 }}>
                  <div className="progressBar">
                    <div
                      className="progressFill"
                      style={{
                        width: `${Math.min(100, Math.round((v.credits / TOTAL_REQUIRED_CREDITS) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="small" style={{ marginTop: 8 }}>
                    คิดเป็น {Math.min(100, Math.round((v.credits / TOTAL_REQUIRED_CREDITS) * 100))}% ของ 120 หน่วยกิต
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ height: 14 }} />

      {/* ✅ Add Course card */}
      <div className="card">
        <h2>Add Course (MySQL)</h2>

        <form onSubmit={handleAddCourse} style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input
              placeholder="Code เช่น CS300"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              style={inputStyle}
              required
            />
            <input
              placeholder="ชื่อวิชา เช่น AI"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              style={inputStyle}
            >
              <option value="Core">Core</option>
              <option value="Major">Major</option>
              <option value="Free">Free</option>
              <option value="GenEd">GenEd</option>
            </select>

            <input
              type="number"
              min={1}
              max={10}
              value={form.credits}
              onChange={(e) => setForm((p) => ({ ...p, credits: Number(e.target.value) }))}
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={saving} style={btnStyle}>
            {saving ? "Adding..." : "Add Course"}
          </button>

          {msg && <div className="small">{msg}</div>}
        </form>
      </div>

      <div className="small" style={{ marginTop: 14, textAlign: "center" }}>
        © Demo KU Credit System — Frontend (React) + Backend (MySQL/Mongo)
      </div>
      <div style={{ height: 14 }} />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,255,255,0.92)",
  outline: "none",
};

const btnStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "linear-gradient(90deg, #006a3d, #0b8a4a)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};