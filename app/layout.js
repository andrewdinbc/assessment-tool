import Sidebar from '../components/Sidebar'
import TopHeader from '../components/TopHeader'
import DevModePanel from '../developer-mode/DevModePanel'
import { C } from '../lib/theme'

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
      </body>
    </html>
  );
}
