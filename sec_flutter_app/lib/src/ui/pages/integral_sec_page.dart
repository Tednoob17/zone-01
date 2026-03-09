import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

class IntegralSecPage extends StatefulWidget {
  const IntegralSecPage({super.key});

  @override
  State<IntegralSecPage> createState() => _IntegralSecPageState();
}

class _IntegralSecPageState extends State<IntegralSecPage> {
  late final WebViewController _controller;
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
    await _loadSecPage();
  }

  Future<void> _loadSecPage() async {
    final html = await rootBundle.loadString('../sec.html');
    await _controller.loadHtmlString(html, baseUrl: 'https://ahsec.local/');
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

  Future<void> _showHelp() async {
    final text = '''
Mode integral autonome actif: l'app charge sec.html embarque dans l'APK.

Tu recuperes ainsi:
- training galaxy / systeme solaire
- bouton + Ajouter lien veille
- bibliotheque et archivage local (fallback interne)
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
            'Source locale: ../sec.html (embarque)',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
      ),
    );
  }
}
