document.addEventListener('DOMContentLoaded', function() {
    const codeDropdown = document.getElementById('codeDropdown');
    const codeInfoSection = document.getElementById('codeInfo');
    const infoPlaceholder = codeInfoSection.querySelector('.info-placeholder');
    
    codeDropdown.addEventListener('change', function() {
        const selectedCode = this.value;
        
        // Hide all code details first
        const allCodeDetails = codeInfoSection.querySelectorAll('.code-detail');
        allCodeDetails.forEach(detail => {
            detail.classList.remove('visible');
            detail.classList.add('hidden');
            // Add fade out animation
            detail.style.opacity = '0';
            detail.style.transition = 'opacity 0.3s ease-out';
        });
        
        if (selectedCode) {
            infoPlaceholder.style.display = 'none';
            
            const selectedDetail = document.getElementById(selectedCode);
            if (selectedDetail) {
                selectedDetail.classList.remove('hidden');
                // Add fade in animation
                setTimeout(() => {
                    selectedDetail.classList.add('visible');
                    selectedDetail.style.opacity = '1';
                }, 100);
                
                selectedDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            infoPlaceholder.style.display = 'block';
        }
    });
    
    // Handle initial selection if there's a hash in the URL
    if (window.location.hash) {
        const codeFromHash = window.location.hash.substring(1);
        if (document.getElementById(codeFromHash)) {
            codeDropdown.value = codeFromHash;
            codeDropdown.dispatchEvent(new Event('change'));
        }
    }
});