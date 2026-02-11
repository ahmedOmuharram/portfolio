import dossierLogo from './brochure/dossier.png'

const files = [
  {
    name: 'Brochure',
    type: 'document',
    description: 'Product landing page',
    href: '/dossier/brochure/',
    modified: 'Feb 11, 2026',
    size: '1 page',
  },
]

function FileIcon({ type }) {
  if (type === 'document') {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="2" width="24" height="32" rx="3" fill="#fff" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
        <path d="M20 2v8a2 2 0 0 0 2 2h6" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" fill="none" />
        <rect x="9" y="16" width="14" height="1.5" rx="0.75" fill="rgba(0,0,0,0.1)" />
        <rect x="9" y="20" width="10" height="1.5" rx="0.75" fill="rgba(0,0,0,0.1)" />
        <rect x="9" y="24" width="12" height="1.5" rx="0.75" fill="rgba(0,0,0,0.1)" />
      </svg>
    )
  }
  if (type === 'folder') {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M4 10a3 3 0 0 1 3-3h8l3 3h12a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V10z" fill="#F4F1EB" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
      </svg>
    )
  }
  return null
}

export default function DossierHome() {
  return (
    <div className="dh-page">
      <header className="dh-header">
        <div className="dh-header-inner">
          <img src={dossierLogo} alt="Dossier" className="dh-logo" />
        </div>
      </header>

      <main className="dh-main">
        <div className="dh-container">
          <div className="dh-toolbar">
            <span className="dh-breadcrumb">
              <span className="dh-breadcrumb-root">Dossier</span>
              <span className="dh-breadcrumb-sep">/</span>
            </span>
            <span className="dh-file-count">{files.length} {files.length === 1 ? 'file' : 'files'}</span>
          </div>

          <div className="dh-file-list">
            <div className="dh-file-list-header">
              <span className="dh-col-name">Name</span>
              <span className="dh-col-modified">Modified</span>
              <span className="dh-col-size">Size</span>
            </div>

            {files.map((file) => (
              <a key={file.name} href={file.href} className="dh-file-row">
                <span className="dh-col-name">
                  <FileIcon type={file.type} />
                  <span className="dh-file-info">
                    <span className="dh-file-name">{file.name}</span>
                    <span className="dh-file-desc">{file.description}</span>
                  </span>
                </span>
                <span className="dh-col-modified">{file.modified}</span>
                <span className="dh-col-size">{file.size}</span>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
