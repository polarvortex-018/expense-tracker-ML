<template>
  <Transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-start justify-center p-2 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-10 safe-area-modal-pt bg-black/75 backdrop-blur-md overflow-y-auto" @click.self="$emit('close')">
      <div class="bg-[#0c0d14] border border-[#1f202e] rounded-2xl w-full max-w-xl p-5 shadow-2xl space-y-5 max-h-[calc(100dvh-1rem)] overflow-y-auto safe-area-pb flex flex-col my-auto pb-48 sm:pb-6">
      
      <!-- Header -->
      <div class="flex justify-between items-center border-b border-[#1f202e] pb-3 shrink-0">
        <div>
          <h3 class="text-base font-bold text-[#f1f0f5] flex items-center gap-2 tracking-tight">
            <span class="material-symbols-outlined text-[#D4BFFF] text-xl">account_balance</span> Financial Vaults Management
          </h3>
          <p class="text-xs text-[#9e9cae] mt-0.5">Switch between isolated database vaults stored locally.</p>
        </div>
        <button @click="$emit('close')" class="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#9e9cae] hover:text-[#f1f0f5] cursor-pointer">
          <span class="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      <!-- Create Vault Form -->
      <form @submit.prevent="handleCreate" class="p-3.5 bg-[#0f1019] border border-[#1f202e] rounded-xl space-y-2.5 shrink-0">
        <p class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">Create New Vault</p>
        <div class="flex flex-col sm:flex-row gap-2">
          <input 
            v-model="newVaultName"
            type="text"
            placeholder="Vault Name (e.g. Freelance, Family, Business)"
            required
            @focus="$event.target.scrollIntoView({ behavior: 'smooth', block: 'center' })"
            class="flex-grow px-3 py-2 bg-[#141520] border border-[#1f202e] focus:border-[#D4BFFF] rounded-lg text-[#f1f0f5] text-xs placeholder-[#9e9cae] focus:outline-none transition min-h-[36px]"
          />
          <button 
            type="submit"
            :disabled="creating"
            class="px-4 py-2 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50 shrink-0 shadow-sm min-h-[36px]"
          >
            {{ creating ? 'Creating...' : '+ Create Vault' }}
          </button>
        </div>
      </form>

      <!-- Vaults List -->
      <div class="space-y-3 flex-1 overflow-y-auto min-h-0">
        <p class="text-xs font-semibold text-[#9e9cae] uppercase tracking-wider">Available Vaults</p>
        
        <div class="divide-y divide-[#1f202e] border-y border-[#1f202e] max-h-64 overflow-y-auto">
          <div 
            v-for="v in vaults" 
            :key="v.filename"
            class="py-3 px-1 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-[#141520] transition gap-3 border-b border-[#1f202e]"
            :class="{ 'bg-[#D4BFFF]/10 border-l-4 border-l-[#D4BFFF]': v.is_active }"
          >
            <div class="flex items-center gap-3 min-w-0 flex-grow">
              <div class="w-9 h-9 rounded-xl bg-[#0f1019] border border-[#1f202e] flex items-center justify-center text-lg shrink-0">
                <span class="material-symbols-outlined text-lg text-[#D4BFFF]">{{ v.is_active ? 'folder_open' : 'folder' }}</span>
              </div>
              <div class="min-w-0 flex-grow">
                <!-- Inline rename input form -->
                <div v-if="editingVaultFilename === v.filename" class="flex items-center gap-2 max-w-full">
                  <input 
                    v-model="editingVaultName" 
                    type="text" 
                    class="flex-grow px-2 py-1 bg-[#0f1019] border border-[#D4BFFF] rounded text-[#f1f0f5] text-xs focus:outline-none min-h-[28px] max-w-[180px] sm:max-w-xs"
                    required
                    @keyup.enter="saveRename(v.filename)"
                    @keyup.esc="editingVaultFilename = null"
                  />
                  <button 
                    type="button" 
                    @click="saveRename(v.filename)" 
                    class="px-2 py-1 bg-[#B3F5E1] hover:bg-[#92edd0] text-[#0f0f15] font-bold text-[10px] rounded transition cursor-pointer min-h-[28px]"
                  >
                    Save
                  </button>
                  <button 
                    type="button" 
                    @click="editingVaultFilename = null" 
                    class="px-2.5 py-1 bg-[#141520] text-[#f1f0f5] border border-[#1f202e] text-[10px] rounded transition cursor-pointer min-h-[28px]"
                  >
                    Cancel
                  </button>
                </div>
                <!-- Normal view mode -->
                <div v-else class="flex items-center gap-2 flex-wrap">
                  <p class="text-sm font-bold text-[#f1f0f5] truncate" :title="v.name">{{ v.name }}</p>
                  <button 
                    @click="startRename(v)" 
                    class="text-[#9e9cae] hover:text-[#D4BFFF] p-1 transition rounded hover:bg-[#141520] text-[10px] flex items-center gap-0.5"
                    title="Rename Vault"
                  >
                    <span class="material-symbols-outlined text-xs">edit</span>
                    <span>Rename</span>
                  </button>
                  <span v-if="v.is_active" class="px-2 py-0.5 rounded text-[9px] font-bold bg-[#B3F5E1]/20 text-[#B3F5E1] border border-[#B3F5E1]/30 shrink-0">
                    Active
                  </span>
                </div>
                
                <!-- Storage Path Display -->
                <p class="text-[9px] text-[#9e9cae] font-mono mt-0.5 truncate" :title="`IndexedDB/vaults/${v.filename}`">
                  path: <span class="text-[#f1f0f5]">IndexedDB/vaults/{{ v.filename }}</span>
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap justify-end">
              <button 
                @click="handleSaveVaultToFolder(v.filename)"
                class="px-2.5 py-1.5 bg-[#0f1019] hover:bg-[#141520] text-[#f1f0f5] border border-[#1f202e] hover:border-[#D4BFFF]/40 font-semibold text-xs rounded-lg transition cursor-pointer flex items-center gap-1 min-h-[32px]"
                title="Save database file directly to your downloads"
              >
                <span>Save To...</span>
              </button>

              <button 
                v-if="!v.is_active"
                @click="$emit('switch-vault', v.filename)"
                class="px-3 py-1.5 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-lg transition cursor-pointer min-h-[32px]"
              >
                Switch
              </button>
              <span v-else class="px-3 py-1.5 bg-[#191924]/60 text-[#6b6a7d] border border-[#29293a] font-bold text-xs rounded-lg select-none min-h-[32px] flex items-center">
                Active
              </span>

              <button 
                v-if="!v.is_active"
                @click="$emit('delete-vault', v.filename)"
                class="p-1.5 text-[#9e9cae] hover:text-[#FFD1B3] hover:bg-[#FFD1B3]/10 border border-transparent hover:border-[#FFD1B3]/30 rounded-lg transition cursor-pointer w-8 h-8 flex items-center justify-center shrink-0"
                title="Delete Vault"
              >
                🗑️
              </button>
              <span v-else class="w-8 h-8 flex items-center justify-center text-[#29293a] shrink-0 select-none cursor-not-allowed" title="Active vault cannot be deleted">
                🗑️
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Import External Vault File -->
      <div class="p-4 bg-[#0f0f15]/30 border border-[#29293a] rounded-xl space-y-3 shrink-0">
        <p class="text-xs font-semibold text-[#9e9cae] uppercase tracking-wider">Import Existing Vault (.db)</p>
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input 
            type="file" 
            ref="fileInput" 
            accept=".db,.sqlite,.cbbak,*/*"
            class="hidden" 
            @change="handleFileSelected"
          />
          <button 
            type="button" 
            @click="$refs.fileInput.click()" 
            class="px-3.5 py-2 bg-[#191924] hover:bg-[#232332] text-[#f1f0f5] border border-[#29293a] font-semibold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[36px]"
          >
            📂 Choose File
          </button>
          <span class="text-xs text-[#9e9cae] truncate flex-grow text-center sm:text-left min-h-[20px] flex items-center justify-center sm:justify-start">
            {{ selectedFileName || 'No file chosen' }}
          </span>
          <button 
            v-if="selectedFile" 
            type="button" 
            @click="handleImport" 
            class="px-3.5 py-2 bg-[#B3F5E1] hover:bg-[#92edd0] text-[#0f0f15] font-bold text-xs rounded-xl transition cursor-pointer shrink-0 min-h-[36px] flex items-center justify-center shadow-sm"
          >
            Import Vault
          </button>
        </div>
      </div>

      <div class="flex justify-end pt-2 shrink-0">
        <button 
          @click="$emit('close')" 
          class="px-4 py-2 bg-[#191924] hover:bg-[#232332] text-[#f1f0f5] border border-[#29293a] font-semibold text-xs rounded-xl transition cursor-pointer"
        >
          Close
        </button>
      </div>

    </div>
  </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';
import { api } from '../services/api';

const props = defineProps({
  isOpen: Boolean,
  vaults: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'switch-vault', 'create-vault', 'import-vault', 'delete-vault', 'rename-vault']);

const newVaultName = ref('');
const creating = ref(false);

const selectedFile = ref(null);
const selectedFileName = ref('');
const fileInput = ref(null);

const editingVaultFilename = ref(null);
const editingVaultName = ref('');

const startRename = (vault) => {
  editingVaultFilename.value = vault.filename;
  editingVaultName.value = vault.name;
};

const saveRename = (filename) => {
  const newName = editingVaultName.value.trim();
  if (!newName) return;
  emit('rename-vault', { filename, name: newName });
  editingVaultFilename.value = null;
};

const handleCreate = async () => {
  if (!newVaultName.value.trim()) return;
  creating.value = true;
  try {
    emit('create-vault', newVaultName.value.trim());
    newVaultName.value = '';
  } finally {
    creating.value = false;
  }
};

const handleFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    selectedFileName.value = file.name;
  }
};

const handleImport = () => {
  if (selectedFile.value) {
    emit('import-vault', selectedFile.value);
    selectedFile.value = null;
    selectedFileName.value = '';
  }
};

const handleSaveVaultToFolder = async (filename) => {
  try {
    await api.shareVaultFile(filename);
  } catch (err) {
    alert(err.message || 'Failed to save vault file.');
  }
};

const formatSize = (bytes) => {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};
</script>
