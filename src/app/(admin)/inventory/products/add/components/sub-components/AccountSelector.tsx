'use client'
import React from 'react'
import { Form } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface AccountSelectorProps {
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  selectedAccount: any;
  setSelectedAccount: (acc: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredAccounts: any[];
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  dropdownOpen,
  setDropdownOpen,
  selectedAccount,
  setSelectedAccount,
  searchQuery,
  setSearchQuery,
  filteredAccounts
}) => {
  return (
    <div className="mb-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="mb-0 fw-semibold text-dark">
          Client Selection
        </h6>
        <span className="badge bg-light text-muted small">Optional</span>
      </div>

      <div className="position-relative">
        <div
          className={`form-control d-flex align-items-center justify-content-between cursor-pointer ${dropdownOpen ? 'border-primary shadow-sm' : ''}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{ cursor: 'pointer', minHeight: '48px' }}
        >
          <div className="d-flex align-items-center flex-grow-1">
            {selectedAccount ? (
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                  style={{ width: '36px', height: '36px', fontSize: '14px', fontWeight: '600' }}
                >
                  {selectedAccount.firstName.charAt(0)}{selectedAccount.lastName.charAt(0)}
                </div>
                <div>
                  <div className="fw-semibold text-dark">
                    {selectedAccount.firstName} {selectedAccount.lastName}
                  </div>
                  <div className="small text-muted">Assigned Account</div>
                </div>
              </div>
            ) : (
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle bg-light border d-flex align-items-center justify-content-center me-3"
                  style={{ width: '36px', height: '36px' }}
                >
                  <IconifyIcon icon="tabler:building-store" className="text-muted" />
                </div>
                <div>
                  <div className="text-muted">General Inventory</div>
                  <div className="small text-muted">No specific account assigned</div>
                </div>
              </div>
            )}
          </div>
          <IconifyIcon
            icon={dropdownOpen ? "tabler:chevron-up" : "tabler:chevron-down"}
            className="text-muted"
          />
        </div>

        {dropdownOpen && (
          <div
            className="position-absolute w-100 bg-white border rounded-3 shadow-lg mt-1"
            style={{ zIndex: 1000 }}
          >
            <div className="p-3 border-bottom bg-light rounded-top">
              <div className="position-relative">
                <IconifyIcon
                  icon="tabler:search"
                  className="position-absolute text-muted"
                  style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <Form.Control
                  type="text"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-5 border-0 shadow-none"
                  style={{ backgroundColor: 'white' }}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              <div
                className={`p-3 d-flex align-items-center cursor-pointer border-bottom ${!selectedAccount ? 'bg-primary bg-opacity-10 border-primary border-opacity-25' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAccount(null);
                  setDropdownOpen(false);
                  setSearchQuery('');
                }}
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="rounded-circle bg-light border d-flex align-items-center justify-content-center me-3"
                  style={{ width: '40px', height: '40px' }}
                >
                  <IconifyIcon icon="tabler:building-store" className="text-primary" />
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold text-primary">General Inventory</div>
                  <div className="small text-muted">Products without specific account assignment</div>
                </div>
                {!selectedAccount && (
                  <IconifyIcon icon="tabler:check" className="text-primary" />
                )}
              </div>

              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((acc) => (
                  <div
                    key={acc._id}
                    className={`p-3 d-flex align-items-center cursor-pointer border-bottom ${selectedAccount?._id === acc._id ? 'bg-primary bg-opacity-10 border-primary border-opacity-25' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAccount(acc);
                      setDropdownOpen(false);
                      setSearchQuery('');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                      style={{ width: '36px', height: '36px', fontSize: '14px', fontWeight: '600' }}
                    >
                      {acc.firstName.charAt(0)}{acc.lastName.charAt(0)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-dark">{acc.firstName} {acc.lastName}</div>
                    </div>
                    {selectedAccount?._id === acc._id && (
                      <IconifyIcon icon="tabler:check" className="text-primary" />
                    )}
                  </div>
                ))
              ) : searchQuery ? (
                <div className="p-4 text-center text-muted">
                  <IconifyIcon icon="tabler:search-off" className="mb-2" style={{ fontSize: '32px' }} />
                  <div>No accounts found matching "{searchQuery}"</div>
                </div>
              ) : (
                <div className="p-4 text-center text-muted">
                  <IconifyIcon icon="tabler:users-off" className="mb-2" style={{ fontSize: '32px' }} />
                  <div>No accounts available</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {dropdownOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 999 }}
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </div>
  )
}

export default React.memo(AccountSelector)
