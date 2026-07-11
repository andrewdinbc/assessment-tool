import Sidebar from '../components/Sidebar'
import DevModePanel from '../developer-mode/DevModePanel'

export const metadata = {
  title: 'Assessment Tool — Chalk & Circuit',
  description: 'Teacher-facing student portfolio and data review platform for Math Mastery and Writing.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, minHeight: '100vh', background: '#f5f0e8' }}>
          {children}
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
