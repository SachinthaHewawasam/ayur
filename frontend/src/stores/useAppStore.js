import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,
      
      // UI state
      sidebarOpen: true,
      theme: 'light',
      notifications: [],
      
      // Search state
      globalSearch: '',
      searchResults: [],
      isSearching: false,
      
      // Filters state
      patientFilters: {},
      appointmentFilters: {},
      medicineFilters: {},
      
      // Modal state
      modals: {
        patientModal: { isOpen: false, patient: null },
        appointmentModal: { isOpen: false, appointment: null },
        medicineModal: { isOpen: false, medicine: null },
      },

      // Auth actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      
      // UI actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, { id: Date.now(), ...notification }]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] }),
      
      // Search actions
      setGlobalSearch: (search) => set({ globalSearch: search }),
      setSearchResults: (results) => set({ searchResults: results }),
      setIsSearching: (isSearching) => set({ isSearching }),
      
      // Filter actions
      setPatientFilters: (filters) => set({ patientFilters: filters }),
      setAppointmentFilters: (filters) => set({ appointmentFilters: filters }),
      setMedicineFilters: (filters) => set({ medicineFilters: filters }),
      
      // Modal actions
      openModal: (type, data = null) => set((state) => ({
        modals: {
          ...state.modals,
          [type]: { isOpen: true, data }
        }
      })),
      closeModal: (type) => set((state) => ({
        modals: {
          ...state.modals,
          [type]: { isOpen: false, data: null }
        }
      })),
      closeAllModals: () => set((state) => ({
        modals: Object.keys(state.modals).reduce((acc, key) => {
          acc[key] = { isOpen: false, data: null };
          return acc;
        }, {})
      })),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        patientFilters: state.patientFilters,
        appointmentFilters: state.appointmentFilters,
        medicineFilters: state.medicineFilters,
      }),
    }
  )
);

export default useAppStore;
