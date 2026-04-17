export type Language = "en" | "it";
export type ThemeMode = "light" | "dark" | "system";

interface Messages {
  nav: {
    portfolio: string;
    admin: string;
    guest: string;
    logout: string;
    language: string;
    loggedOut: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
  };
  common: {
    loadingWorkspace: string;
    loading: string;
    refresh: string;
    folderIdOptional: string;
    searchByName: string;
    noContent: string;
    folder: string;
    file: string;
    updated: string;
    open: string;
    view: string;
    close: string;
    offline: string;
    backOnline: string;
  };
  portfolio: {
    eyebrow: string;
    title: string;
    subtitle: string;
    driveConnection: string;
    checking: string;
    online: string;
    error: string;
    backFolder: string;
    currentFolder: string;
    rootConfigured: string;
    unableToLoad: string;
    home: string;
    searchPlaceholder: string;
    itemCount: string;
    newFolder: string;
    newFolderTitle: string;
    folderNameLabel: string;
    folderNamePlaceholder: string;
    folderCreated: string;
    folderCreateError: string;
    cancel: string;
    searchFullText: string;
    searchByName: string;
  };
  filter: {
    typeAll: string;
    typeFolders: string;
    typeImages: string;
    sortNameAsc: string;
    sortNameDesc: string;
    sortNewest: string;
    sortOldest: string;
    sortBy: string;
    filterType: string;
  };
  share: {
    share: string;
    copyLink: string;
    copiedToClipboard: string;
    shareOn: string;
  };
  social: {
    comments: string;
    addComment: string;
    commentPlaceholder: string;
    post: string;
    noComments: string;
    deleteComment: string;
    rating: string;
    yourRating: string;
    averageRating: string;
    loginToComment: string;
    loginToRate: string;
  };
  upload: {
    title: string;
    dragDrop: string;
    browseFiles: string;
    uploading: string;
    uploadComplete: string;
    uploadFailed: string;
    fileTypeError: string;
    sizeLimit: string;
    selectFiles: string;
  };
  analytics: {
    title: string;
    totalViews: string;
    uniqueItems: string;
    totalSearches: string;
    viewsOverTime: string;
    topItems: string;
    topSearches: string;
    today: string;
    thisWeek: string;
    thisMonth: string;
    allTime: string;
    noData: string;
  };
  admin: {
    accessEyebrow: string;
    accessTitle: string;
    accessSubtitle: string;
    username: string;
    password: string;
    login: string;
    loginFailed: string;
    loginSuccess: string;
    workspaceEyebrow: string;
    workspaceTitle: string;
    workspaceSubtitle: string;
    role: string;
    loadItems: string;
    pleaseLogin: string;
    actionFailed: string;
    loadDriveFailed: string;
    viewerReadOnly: string;
    configTitle: string;
    brandName: string;
    apiBaseUrl: string;
    defaultFolderId: string;
    visibilityMode: string;
    publicMode: string;
    privateMode: string;
    saveConfig: string;
    configSaved: string;
    configHelp: string;
    apiBaseUrlHint: string;
    defaultFolderIdHint: string;
    browseHelp: string;
    adminActionsHelp: string;
  };
  actions: {
    title: string;
    selected: string;
    noSelected: string;
    createFolder: string;
    folderName: string;
    parentFolderIdOptional: string;
    create: string;
    saving: string;
    selectedActions: string;
    newName: string;
    rename: string;
    targetParentFolderId: string;
    move: string;
    copyNameOptional: string;
    copy: string;
    delete: string;
    deleting: string;
    itemRenamed: string;
    itemMoved: string;
    itemCopied: string;
    itemDeleted: string;
    folderCreated: string;
  };
}

export type AppMessages = Messages;

const messages: Record<Language, Messages> = {
  en: {
    nav: {
      portfolio: "Portfolio",
      admin: "Admin",
      guest: "Guest",
      logout: "Logout",
      language: "Language",
      loggedOut: "You have been logged out.",
      theme: "Theme",
      themeLight: "Light",
      themeDark: "Dark",
      themeSystem: "System",
    },
    common: {
      loadingWorkspace: "Loading workspace...",
      loading: "Loading...",
      refresh: "Refresh",
      folderIdOptional: "Folder ID (optional)",
      searchByName: "Search by name",
      noContent: "No content found in this folder.",
      folder: "Folder",
      file: "File",
      updated: "Updated",
      open: "Open",
      view: "View",
      close: "Close",
      offline: "You are offline. Some features may be unavailable.",
      backOnline: "Back online!",
    },
    portfolio: {
      eyebrow: "Portfolio",
      title: "Decorative Facades & Mural Restoration",
      subtitle: "Trompe l'oeil, historic conservation, decorative panels, ornamental ceilings — 30 years of artisan craftsmanship in Liguria.",
      driveConnection: "Drive connection",
      checking: "Checking",
      online: "Online",
      error: "Error",
      backFolder: "Back Folder",
      currentFolder: "Current folder",
      rootConfigured: "Root configured on backend",
      unableToLoad: "Unable to load gallery",
      home: "Home",
      searchPlaceholder: "Search works…",
      itemCount: "{count} items",
      newFolder: "New Folder",
      newFolderTitle: "Create New Folder",
      folderNameLabel: "Folder name",
      folderNamePlaceholder: "Enter folder name…",
      folderCreated: "Folder created successfully",
      folderCreateError: "Failed to create folder",
      cancel: "Cancel",
      searchFullText: "Search content & metadata…",
      searchByName: "Search by name",
    },
    filter: {
      typeAll: "All",
      typeFolders: "Folders only",
      typeImages: "Images only",
      sortNameAsc: "Name A–Z",
      sortNameDesc: "Name Z–A",
      sortNewest: "Newest first",
      sortOldest: "Oldest first",
      sortBy: "Sort",
      filterType: "Type",
    },
    share: {
      share: "Share",
      copyLink: "Copy link",
      copiedToClipboard: "Link copied to clipboard!",
      shareOn: "Share on",
    },
    social: {
      comments: "Comments",
      addComment: "Add a comment",
      commentPlaceholder: "Write a comment…",
      post: "Post",
      noComments: "No comments yet. Be the first!",
      deleteComment: "Delete",
      rating: "Rating",
      yourRating: "Your rating",
      averageRating: "Average",
      loginToComment: "Login to comment",
      loginToRate: "Login to rate",
    },
    upload: {
      title: "Upload Files",
      dragDrop: "Drag and drop files here, or",
      browseFiles: "browse files",
      uploading: "Uploading…",
      uploadComplete: "Upload complete!",
      uploadFailed: "Upload failed",
      fileTypeError: "Unsupported file type. Use JPEG, PNG, WebP, or PDF.",
      sizeLimit: "File size must be under 25 MB.",
      selectFiles: "Select files",
    },
    analytics: {
      title: "Analytics Dashboard",
      totalViews: "Total Views",
      uniqueItems: "Unique Items Viewed",
      totalSearches: "Total Searches",
      viewsOverTime: "Views Over Time",
      topItems: "Most Viewed Items",
      topSearches: "Top Search Terms",
      today: "Today",
      thisWeek: "This Week",
      thisMonth: "This Month",
      allTime: "All Time",
      noData: "No analytics data yet.",
    },
    admin: {
      accessEyebrow: "Administrator Access",
      accessTitle: "Manage Portfolio Content",
      accessSubtitle: "Login as admin or viewer. Only admin can modify Google Drive content.",
      username: "Username",
      password: "Password",
      login: "Login",
      loginFailed: "Login failed",
      loginSuccess: "Welcome! Login successful.",
      workspaceEyebrow: "Admin Workspace",
      workspaceTitle: "Drive Content Management",
      workspaceSubtitle: "Folder operations are protected by role-based authorization.",
      role: "Role",
      loadItems: "Load Items",
      pleaseLogin: "Please login first",
      actionFailed: "Action failed",
      loadDriveFailed: "Unable to load Drive items",
      viewerReadOnly: "Viewer role is read-only. Login with admin role for write actions.",
      configTitle: "Display and Runtime Configuration",
      brandName: "Brand Name",
      apiBaseUrl: "Frontend API Base URL",
      defaultFolderId: "Default Folder ID",
      visibilityMode: "Visibility Mode",
      publicMode: "Public",
      privateMode: "Private",
      saveConfig: "Save Configuration",
      configSaved: "Configuration saved.",
      configHelp: "Set the backend API address and display preferences. Expand to edit.",
      apiBaseUrlHint: "e.g. https://artgallery-backend.onrender.com/api",
      defaultFolderIdHint: "Google Drive folder ID to load by default",
      browseHelp: "Enter a folder ID or search term, then click Load to browse Drive content.",
      adminActionsHelp: "Select an item from the gallery grid above, then use these controls.",
    },
    actions: {
      title: "Admin Controls",
      selected: "Selected",
      noSelected: "No item selected",
      createFolder: "Create Folder",
      folderName: "Folder name",
      parentFolderIdOptional: "Parent folder ID (optional)",
      create: "Create",
      saving: "Saving...",
      selectedActions: "Selected Item Actions",
      newName: "New name",
      rename: "Rename",
      targetParentFolderId: "Target parent folder ID",
      move: "Move",
      copyNameOptional: "Copy name (optional)",
      copy: "Copy",
      delete: "Delete",
      deleting: "Deleting...",
      itemRenamed: "Item renamed.",
      itemMoved: "Item moved.",
      itemCopied: "Item copied.",
      itemDeleted: "Item deleted.",
      folderCreated: "Folder \"{name}\" created.",
    },
  },
  it: {
    nav: {
      portfolio: "Portfolio",
      admin: "Admin",
      guest: "Ospite",
      logout: "Esci",
      language: "Lingua",
      loggedOut: "Sei stato disconnesso.",
      theme: "Tema",
      themeLight: "Chiaro",
      themeDark: "Scuro",
      themeSystem: "Sistema",
    },
    common: {
      loadingWorkspace: "Caricamento workspace...",
      loading: "Caricamento...",
      refresh: "Aggiorna",
      folderIdOptional: "ID cartella (opzionale)",
      searchByName: "Cerca per nome",
      noContent: "Nessun contenuto trovato in questa cartella.",
      folder: "Cartella",
      file: "File",
      updated: "Aggiornato",
      open: "Apri",
      view: "Visualizza",
      close: "Chiudi",
      offline: "Sei offline. Alcune funzionalità potrebbero non essere disponibili.",
      backOnline: "Di nuovo online!",
    },
    portfolio: {
      eyebrow: "Portfolio",
      title: "Facciate Decorative & Restauro Murale",
      subtitle: "Trompe l'oeil, restauro conservativo, pannelli decorativi, soffitti ornamentali — 30 anni di artigianato in Liguria.",
      driveConnection: "Connessione Drive",
      checking: "Verifica",
      online: "Online",
      error: "Errore",
      backFolder: "Cartella Precedente",
      currentFolder: "Cartella corrente",
      rootConfigured: "Root configurata nel backend",
      unableToLoad: "Impossibile caricare la galleria",
      home: "Home",
      searchPlaceholder: "Cerca opere…",
      itemCount: "{count} elementi",
      newFolder: "Nuova Cartella",
      newFolderTitle: "Crea Nuova Cartella",
      folderNameLabel: "Nome cartella",
      folderNamePlaceholder: "Inserisci nome cartella…",
      folderCreated: "Cartella creata con successo",
      folderCreateError: "Errore nella creazione della cartella",
      cancel: "Annulla",
      searchFullText: "Cerca contenuto e metadati…",
      searchByName: "Cerca per nome",
    },
    filter: {
      typeAll: "Tutti",
      typeFolders: "Solo cartelle",
      typeImages: "Solo immagini",
      sortNameAsc: "Nome A–Z",
      sortNameDesc: "Nome Z–A",
      sortNewest: "Più recenti",
      sortOldest: "Meno recenti",
      sortBy: "Ordina",
      filterType: "Tipo",
    },
    share: {
      share: "Condividi",
      copyLink: "Copia link",
      copiedToClipboard: "Link copiato negli appunti!",
      shareOn: "Condividi su",
    },
    social: {
      comments: "Commenti",
      addComment: "Aggiungi un commento",
      commentPlaceholder: "Scrivi un commento…",
      post: "Pubblica",
      noComments: "Nessun commento ancora. Sii il primo!",
      deleteComment: "Elimina",
      rating: "Valutazione",
      yourRating: "La tua valutazione",
      averageRating: "Media",
      loginToComment: "Accedi per commentare",
      loginToRate: "Accedi per valutare",
    },
    upload: {
      title: "Carica File",
      dragDrop: "Trascina i file qui, oppure",
      browseFiles: "sfoglia file",
      uploading: "Caricamento…",
      uploadComplete: "Caricamento completato!",
      uploadFailed: "Caricamento non riuscito",
      fileTypeError: "Tipo di file non supportato. Usa JPEG, PNG, WebP o PDF.",
      sizeLimit: "Il file deve essere inferiore a 25 MB.",
      selectFiles: "Seleziona file",
    },
    analytics: {
      title: "Dashboard Analitiche",
      totalViews: "Visualizzazioni totali",
      uniqueItems: "Elementi unici visualizzati",
      totalSearches: "Ricerche totali",
      viewsOverTime: "Visualizzazioni nel tempo",
      topItems: "Elementi più visti",
      topSearches: "Termini più cercati",
      today: "Oggi",
      thisWeek: "Questa settimana",
      thisMonth: "Questo mese",
      allTime: "Tutto",
      noData: "Nessun dato analitico disponibile.",
    },
    admin: {
      accessEyebrow: "Accesso Amministratore",
      accessTitle: "Gestione Contenuti Portfolio",
      accessSubtitle: "Accedi come admin o viewer. Solo admin puo modificare contenuti Google Drive.",
      username: "Utente",
      password: "Password",
      login: "Accedi",
      loginFailed: "Accesso non riuscito",
      loginSuccess: "Benvenuto! Accesso riuscito.",
      workspaceEyebrow: "Area Admin",
      workspaceTitle: "Gestione Contenuti Drive",
      workspaceSubtitle: "Le operazioni sulle cartelle sono protette da autorizzazione basata sui ruoli.",
      role: "Ruolo",
      loadItems: "Carica Elementi",
      pleaseLogin: "Effettua prima il login",
      actionFailed: "Operazione non riuscita",
      loadDriveFailed: "Impossibile caricare elementi Drive",
      viewerReadOnly: "Il ruolo viewer e sola lettura. Accedi come admin per operazioni di scrittura.",
      configTitle: "Configurazione Grafica e Runtime",
      brandName: "Nome Brand",
      apiBaseUrl: "URL Base API Frontend",
      defaultFolderId: "ID Cartella Predefinita",
      visibilityMode: "Modalita Visibilita",
      publicMode: "Pubblico",
      privateMode: "Privato",
      saveConfig: "Salva Configurazione",
      configSaved: "Configurazione salvata.",
      configHelp: "Imposta l'indirizzo API del backend e le preferenze di visualizzazione. Espandi per modificare.",
      apiBaseUrlHint: "es. https://artgallery-backend.onrender.com/api",
      defaultFolderIdHint: "ID cartella Google Drive da caricare per impostazione predefinita",
      browseHelp: "Inserisci un ID cartella o un termine di ricerca, poi premi Carica per esplorare il Drive.",
      adminActionsHelp: "Seleziona un elemento dalla griglia sopra, poi usa questi controlli.",
    },
    actions: {
      title: "Controlli Admin",
      selected: "Selezionato",
      noSelected: "Nessun elemento selezionato",
      createFolder: "Crea Cartella",
      folderName: "Nome cartella",
      parentFolderIdOptional: "ID cartella padre (opzionale)",
      create: "Crea",
      saving: "Salvataggio...",
      selectedActions: "Azioni Elemento Selezionato",
      newName: "Nuovo nome",
      rename: "Rinomina",
      targetParentFolderId: "ID cartella destinazione",
      move: "Sposta",
      copyNameOptional: "Nome copia (opzionale)",
      copy: "Copia",
      delete: "Elimina",
      deleting: "Eliminazione...",
      itemRenamed: "Elemento rinominato.",
      itemMoved: "Elemento spostato.",
      itemCopied: "Elemento copiato.",
      itemDeleted: "Elemento eliminato.",
      folderCreated: "Cartella \"{name}\" creata.",
    },
  },
};

export function getMessages(language: Language): Messages {
  return messages[language];
}
