import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:webview_flutter/webview_flutter.dart';

class IntegralSecPage extends StatefulWidget {
  const IntegralSecPage({super.key});

  @override
  State<IntegralSecPage> createState() => _IntegralSecPageState();
}

class _IntegralSecPageState extends State<IntegralSecPage> {
  static const _baseUrlKey = 'sec_integral_base_url';
  static const _defaultBaseUrl = 'http://10.0.2.2:4173';

  late final WebViewController _controller;
  String _baseUrl = _defaultBaseUrl;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => setState(() => _loading = true),
          onPageFinished: (_) async {
            await _injectInAppNavigationPatch();
            if (mounted) {
              setState(() => _loading = false);
            }
          },
        ),
      );
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_baseUrlKey);
    _baseUrl = (saved == null || saved.trim().isEmpty) ? _defaultBaseUrl : saved.trim();
    await _loadSecPage();
  }

  Future<void> _loadSecPage() async {
    final url = _secPageUrl;
    await _controller.loadRequest(Uri.parse(url));
  }

  String get _secPageUrl {
    final trimmed = _baseUrl.trim();
    final normalized = trimmed.endsWith('/') ? trimmed.substring(0, trimmed.length - 1) : trimmed;
    return '$normalized/sec.html';
  }

  Future<void> _injectInAppNavigationPatch() async {
    // Ensure links with target="_blank" and window.open stay in the same WebView.
    await _controller.runJavaScript('''
      (function () {
        const anchors = document.querySelectorAll('a[target="_blank"]');
        anchors.forEach(function(a){ a.setAttribute('target', '_self'); });
        window.open = function(url){
          if (url) { window.location.href = url; }
          return null;
        };
      })();
    ''');
  }

  Future<void> _showServerDialog() async {
    final ctrl = TextEditingController(text: _baseUrl);
    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Serveur sec.html / archive'),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(
            hintText: 'http://10.0.2.2:4173',
            labelText: 'Base URL',
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, ctrl.text.trim()), child: const Text('Save')),
        ],
      ),
    );

    if (result == null || result.isEmpty) return;

    final value = result.endsWith('/') ? result.substring(0, result.length - 1) : result;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_baseUrlKey, value);

    if (!mounted) return;
    setState(() => _baseUrl = value);
    await _loadSecPage();
  }

  Future<void> _showHelp() async {
    final text = '''
Mode integral actif: l'app charge exactement sec.html.

Checklist pour que tout marche:
1. Lance le serveur local: node archive-server.js (a la racine zone-01)
2. Sur Android emulator utilise: http://10.0.2.2:4173
3. Dans cette app: bouton reglages -> Base URL
4. Recharge la page

Tu recuperes ainsi:
- training galaxy / systeme solaire
- bouton + Ajouter lien veille
- bibliotheque offline et archivage /api/archive
- toutes les sections exactes de sec.html
''';

    if (!mounted) return;
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Aide'),
        content: Text(text),
        actions: [
          FilledButton(onPressed: () => Navigator.pop(context), child: const Text('OK')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SECU Integral'),
        actions: [
          IconButton(
            tooltip: 'Aide',
            onPressed: _showHelp,
            icon: const Icon(Icons.help_outline_rounded),
          ),
          IconButton(
            tooltip: 'Changer serveur',
            onPressed: _showServerDialog,
            icon: const Icon(Icons.settings_rounded),
          ),
          IconButton(
            tooltip: 'Recharger',
            onPressed: _loadSecPage,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_loading)
            const Align(
              alignment: Alignment.topCenter,
              child: LinearProgressIndicator(minHeight: 3),
            ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
          child: Text(
            'Source: $_secPageUrl',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
      ),
    );
  }
}
