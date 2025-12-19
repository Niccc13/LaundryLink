const SERVICE_ID = "service_cid3y4v"; 
const TEMPLATE_ID = "template_swbz8bu";
const PUBLIC_KEY = "6162287aq69mZ8R9i";

emailjs.init(PUBLIC_KEY);

document.addEventListener('DOMContentLoaded', function() {
    initializeSystem();
    
    document.getElementById('custService').addEventListener('change', function() {
        const specialOptions = document.getElementById('specialOptions');
        specialOptions.style.display = this.value === 'Special Treatment' ? 'block' : 'none';
    });
    
    document.getElementById('saveEditBtn').addEventListener('click', saveEdit);
    
    document.getElementById('editModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditModal();
        }
    });
    
    document.getElementById('qrPopup').addEventListener('click', function(e) {
        if (e.target === this) {
            closeQR();
        }
    });
    
    displayRecords();
    
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('searchBox')?.focus();
        }
        
        if (e.key === 'Escape') {
            resetFilters();
        }
    });
});