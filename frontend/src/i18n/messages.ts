export type Language = "en" | "it";

interface Messages {
  nav: {
    portfolio: string;
    admin: string;
    guest: string;
    logout: string;
    language: string;
    loggedOut: string;
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
    },
    portfolio: {
      eyebrow: "Customer Showcase",
      title: "Decorative Facades and Roofing Portfolio",
      subtitle: "Explore completed exterior projects with image quality optimized for mobile, tablet, and desktop.",
      driveConnection: "Drive connection",
      checking: "Checking",
      online: "Online",
      error: "Error",
      backFolder: "Back Folder",
      currentFolder: "Current folder",
      rootConfigured: "Root configured on backend",
      unableToLoad: "Unable to load gallery",
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
    },
    portfolio: {
      eyebrow: "Vetrina Cliente",
      title: "Portfolio Facciate Decorative e Coperture",
      subtitle: "Esplora i lavori esterni completati con immagini ottimizzate per smartphone, tablet e desktop.",
      driveConnection: "Connessione Drive",
      checking: "Verifica",
      online: "Online",
      error: "Errore",
      backFolder: "Cartella Precedente",
      currentFolder: "Cartella corrente",
      rootConfigured: "Root configurata nel backend",
      unableToLoad: "Impossibile caricare la galleria",
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
