import { AjaxHook, ScanResult } from '@/types'

export const mockHooks: AjaxHook[] = [
  {
    id: '1',
    hookType: 'wp_ajax',
    hookName: 'wp_ajax_save_settings',
    callbackFunction: 'handle_save_settings',
    filePath: 'includes/admin-settings.php',
    lineNumber: 45,
    securityChecks: {
      currentUserCan: false,
      wpVerifyNonce: false,
      checkAjaxReferer: false,
      checkAdminReferer: false
    },
    vulnerabilityLevel: 'vulnerable',
    codeSnippet: `function handle_save_settings() {
    $settings = $_POST['settings'];
    update_option('plugin_settings', $settings);
    wp_die('Settings saved');
}`
  },
  {
    id: '2',
    hookType: 'wp_ajax_nopriv',
    hookName: 'wp_ajax_nopriv_contact_form',
    callbackFunction: 'process_contact_form',
    filePath: 'public/contact-handler.php',
    lineNumber: 23,
    securityChecks: {
      currentUserCan: false,
      wpVerifyNonce: true,
      checkAjaxReferer: false,
      checkAdminReferer: false
    },
    vulnerabilityLevel: 'warning',
    codeSnippet: `function process_contact_form() {
    if (!wp_verify_nonce($_POST['nonce'], 'contact_form')) {
        wp_die('Invalid nonce');
    }
    $email = sanitize_email($_POST['email']);
    // Process form...
    wp_die('Form submitted');
}`
  },
  {
    id: '3',
    hookType: 'wp_ajax',
    hookName: 'wp_ajax_delete_post',
    callbackFunction: 'handle_delete_post',
    filePath: 'includes/post-actions.php',
    lineNumber: 78,
    securityChecks: {
      currentUserCan: true,
      wpVerifyNonce: true,
      checkAjaxReferer: false,
      checkAdminReferer: false
    },
    vulnerabilityLevel: 'secure',
    codeSnippet: `function handle_delete_post() {
    if (!current_user_can('delete_posts')) {
        wp_die('Insufficient permissions');
    }

    if (!wp_verify_nonce($_POST['nonce'], 'delete_post')) {
        wp_die('Invalid nonce');
    }

    $post_id = intval($_POST['post_id']);
    wp_delete_post($post_id);
    wp_die('Post deleted');
}`
  },
  {
    id: '4',
    hookType: 'wp_ajax',
    hookName: 'wp_ajax_export_data',
    callbackFunction: 'handle_data_export',
    filePath: 'includes/export-handler.php',
    lineNumber: 12,
    securityChecks: {
      currentUserCan: true,
      wpVerifyNonce: false,
      checkAjaxReferer: false,
      checkAdminReferer: false
    },
    vulnerabilityLevel: 'warning',
    codeSnippet: `function handle_data_export() {
    if (!current_user_can('export')) {
        wp_die('Access denied');
    }

    // Missing nonce verification!
    $data = get_user_data($_POST['user_id']);
    echo json_encode($data);
    wp_die();
}`
  },
  {
    id: '5',
    hookType: 'wp_ajax_nopriv',
    hookName: 'wp_ajax_nopriv_public_api',
    callbackFunction: 'public_api_handler',
    filePath: 'public/api-endpoint.php',
    lineNumber: 67,
    securityChecks: {
      currentUserCan: false,
      wpVerifyNonce: false,
      checkAjaxReferer: false,
      checkAdminReferer: false
    },
    vulnerabilityLevel: 'vulnerable',
    codeSnippet: `function public_api_handler() {
    // No security checks at all!
    $action = $_POST['action'];
    $data = $_POST['data'];

    // Direct database query without sanitization
    global $wpdb;
    $results = $wpdb->get_results("SELECT * FROM table WHERE id = " . $_POST['id']);

    echo json_encode($results);
    wp_die();
}`
  }
]

export const mockScanResult: ScanResult = {
  id: 'scan-1',
  pluginName: 'Contact Form Pro',
  uploadedAt: new Date('2024-01-15T10:30:00'),
  totalHooks: mockHooks.length,
  vulnerableHooks: mockHooks.filter(h => h.vulnerabilityLevel === 'vulnerable').length,
  hooks: mockHooks,
  status: 'completed'
}