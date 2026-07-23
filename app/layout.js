import Sidebar from '../components/Sidebar'
import TopHeader from '../components/TopHeader'
import DevModePanel from '../developer-mode/DevModePanel'
import { C } from '../lib/theme'
import MorpheusChat from '../components/MorpheusChat'

export const metadata = {
  title: 'Assessment Tool — Chalk & Circuit',
  description: 'Teacher-facing student portfolio and data review platform for Math Mastery and Writing.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <TopHeader />
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <div style={{ flex: 1, minHeight: 'calc(100vh - 49px)', background: C.bg }}>
            {children}
          </div>
        </div>
        <footer style={{ padding: "20px 24px", borderTop: "1px solid #e3ddd0", fontSize: 12, color: "#6b6459", textAlign: "center", background: "#f7f5f0" }}>
          <a href="https://morpheus-scheduler.vercel.app/data-residency" target="_blank" rel="noopener noreferrer" style={{ color: "#1c3557", textDecoration: "underline" }}>
            Data Residency &amp; Privacy Disclosure
          </a>
        </footer>
        <DevModePanel
          productName="Assessment Tool"
          sourceRepo="andrewdinbc/assessment-tool"
          userEmail="andrewsinbc3@gmail.com"
          userKey="owner"
          morpheusUrl="https://morpheus-scheduler.vercel.app"
          enabled={true}
          audienceLabel="a K-8 teacher reviewing AI-graded student assessments and class-level analytics (not a student-facing product)"
          mode="personal"
        />
              <MorpheusChat productName="Assessment Tool" />
      </body>
    </html>
  );
}
