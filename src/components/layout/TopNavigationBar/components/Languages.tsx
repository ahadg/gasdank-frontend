import Image from 'next/image'
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { languages } from '../data'
import { useLanguageStore, Language } from '@/store/languageStore'


const Country = () => {
  const { language: currentLang, setLanguage } = useLanguageStore()

  // Function to map language names from data to our Language type
  const getLangCode = (langName: string): Language => {
    switch (langName.toLowerCase()) {
      case 'spanish': return 'es'
      case 'german': return 'de'
      case 'italian': return 'it'
      case 'hindi': return 'hi'
      case 'russian': return 'ru'
      default: return 'en'
    }
  }

  const selectedLanguage = languages.find(l => getLangCode(l.language) === currentLang) || languages[0]

  return (
    <div className="topbar-item">
      <Dropdown className="" align={'end'}>
        <DropdownToggle as={'button'} className="topbar-link content-none px-2 d-flex align-items-center gap-1" data-bs-offset="0,25" aria-haspopup="false"
          aria-expanded="false">
          <span className="text-sm font-medium">{selectedLanguage.language}</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          {
            languages.map((item, idx) => (
              <DropdownItem key={idx} onClick={() => setLanguage(getLangCode(item.language))} className="d-flex align-items-center">
                <span className="align-middle">{item.language}</span>
              </DropdownItem>
            ))
          }
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default Country