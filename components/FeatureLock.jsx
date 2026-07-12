'use client'
import { C } from '../lib/theme'
import Tooltip from './Tooltip'

// Wraps any feature that depends on another Chalk & Circuit product being
// connected. If entitled, renders children untouched. If not, greys them
// out (disabled, dimmed, not clickable) and shows a tooltip explaining
// which product it's part of and where to get it.
export default function FeatureLock({ entitlement, children }) {
  if (!entitlement || entitlement.connected) return children

  return (
    <Tooltip
      text={`This is a feature in ${entitlement.name}. Go to ${entitlement.purchaseUrl.replace('https://', '')} to purchase.`}
      width={240}
    >
      <a
        href={entitlement.purchaseUrl}
        target="_blank"
        rel="noreferrer"
        style={{ textDecoration: 'none', display: 'block', cursor: 'not-allowed' }}
        onClick={(e) => {
          // Let the click still navigate to the purchase page (useful),
          // but don't let it fall through to whatever the disabled
          // control underneath would have done.
          e.stopPropagation()
        }}
      >
        <div style={{ opacity: 0.45, pointerEvents: 'none', filter: 'grayscale(0.6)', position: 'relative' }}>
          {children}
        </div>
      </a>
    </Tooltip>
  )
}
