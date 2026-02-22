import { useCallback } from "react";
import { useTabStore } from "../stores/tab-store";
import { useFileStore } from "../stores/file-store";

export function useNavigation() {
  const navigate = useTabStore((s) => s.navigate);
  const goBack = useTabStore((s) => s.goBack);
  const goForward = useTabStore((s) => s.goForward);
  const goUp = useTabStore((s) => s.goUp);
  const loadDirectory = useFileStore((s) => s.loadDirectory);

  const navigateTo = useCallback(
    (path: string) => {
      navigate(path);
      loadDirectory(path);
    },
    [navigate, loadDirectory]
  );

  const back = useCallback(() => {
    goBack();
    const tab = useTabStore.getState().tabs.find(
      (t) => t.id === useTabStore.getState().activeTabId
    );
    if (tab) loadDirectory(tab.path);
  }, [goBack, loadDirectory]);

  const forward = useCallback(() => {
    goForward();
    const tab = useTabStore.getState().tabs.find(
      (t) => t.id === useTabStore.getState().activeTabId
    );
    if (tab) loadDirectory(tab.path);
  }, [goForward, loadDirectory]);

  const up = useCallback(() => {
    goUp();
    const tab = useTabStore.getState().tabs.find(
      (t) => t.id === useTabStore.getState().activeTabId
    );
    if (tab) loadDirectory(tab.path);
  }, [goUp, loadDirectory]);

  const refresh = useCallback(() => {
    const tab = useTabStore.getState().tabs.find(
      (t) => t.id === useTabStore.getState().activeTabId
    );
    if (tab) loadDirectory(tab.path);
  }, [loadDirectory]);

  return { navigateTo, back, forward, up, refresh };
}
