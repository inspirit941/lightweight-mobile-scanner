import {
	type RenderAPI,
	type RenderHookResult,
	render,
	renderHook,
} from "@testing-library/react-native";
import type { ReactElement, ReactNode } from "react";
import { ScanSessionProvider } from "../context/scanSessionContext";

export function scanSessionWrapper({ children }: { children: ReactNode }) {
	return <ScanSessionProvider>{children}</ScanSessionProvider>;
}

export function renderWithScanSession(ui: ReactElement): RenderAPI {
	return render(<ScanSessionProvider>{ui}</ScanSessionProvider>);
}

export function renderHookWithScanSession<Result>(
	renderCallback: () => Result,
): RenderHookResult<Result, undefined> {
	return renderHook(renderCallback, { wrapper: scanSessionWrapper });
}
