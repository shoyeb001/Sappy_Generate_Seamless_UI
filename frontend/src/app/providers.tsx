import type { ReactNode } from "react"
import { Provider } from "react-redux"
import { store } from "~/app/store"
import { ThemeProvider } from "~/shared/components/theme/theme-provider"

export const Providers = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>
    <ThemeProvider>{children}</ThemeProvider>
  </Provider>
)
