<template>
    <button class="btn btn-link theme-toggle-btn" @click="toggleTheme"
        :title="currentTheme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'">
        <b-icon v-if="currentTheme === 'dark'" icon="sun-fill" variant="warning" scale="1.2"></b-icon>
        <b-icon v-else icon="moon-stars-fill" variant="secondary" scale="1.2"></b-icon>
    </button>
</template>

<script>
export default {
    name: 'ThemeToggle',
    data() {
        return {
            currentTheme: 'dark' // Default to dark (Slate)
        }
    },
    mounted() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);
    },
    methods: {
        toggleTheme() {
            const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        },
        setTheme(theme) {
            this.currentTheme = theme;
            localStorage.setItem('theme', theme);

            // 1. Swap CSS File
            const themeLink = document.getElementById('theme-css');
            if (themeLink) {
                // Map 'dark' -> 'slate', 'light' -> 'light' (Flatly)
                const themeFile = theme === 'dark' ? 'bootstrap_slate.min.css' : 'bootstrap_light.min.css';
                themeLink.href = `/css/${themeFile}`;
            }

            // 2. Set Bootstrap 5 attribute (for any BS5 components/utilities)
            document.documentElement.setAttribute('data-bs-theme', theme);
        }
    }
}
</script>

<style scoped>
.theme-toggle-btn {
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
}

.theme-toggle-btn:hover {
    transform: scale(1.1);
    text-decoration: none;
}
</style>
