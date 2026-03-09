import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:webview_flutter/webview_flutter.dart';

import '../../data/local_archive_store.dart';

class IntegralSecPage extends StatefulWidget {
  const IntegralSecPage({super.key});

  @override
  State<IntegralSecPage> createState() => _IntegralSecPageState();
}

class _IntegralSecPageState extends State<IntegralSecPage> {
  late final WebViewController _controller;
  final LocalArchiveStore _store = LocalArchiveStore();
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
            await _injectBridge();
            if (mounted) setState(() => _loading = false);
          },
        ),
      )
      ..addJavaScriptChannel('AhsecArchive',
          onMessageReceived: _onBridgeMessage);
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    await _loadSecPage();
  }

  Future<void> _loadSecPage() async {
    String html;
    try {
      html = await rootBundle.loadString('sec.html');
    } catch (_) {
      try {
        html = await rootBundle.loadString('../sec.html');
      } catch (_) {
        html =
            '<!doctype html><html><head><meta charset="utf-8"><title>Ahsec</title></head>'
            '<body style="font-family:system-ui;background:#0b1220;color:#e5e7eb;padding:24px">'
            '<h1>Ahsec</h1><p>sec.html introuvable. Rebuild requis.</p></body></html>';
      }
    }
    await _controller.loadHtmlString(html, baseUrl: 'https://ahsec.local/');
  }

  // ── JS -> Flutter bridge ─────────────────────────────────────────────────

  Future<void> _onBridgeMessage(JavaScriptMessage msg) async {
    Map<String, dynamic> request;
    try {
      request = jsonDecode(msg.message) as Map<String, dynamic>;
    } catch (_) {
      return;
    }

    final action = request['action'] as String? ?? '';
    final cbId = request['callbackId'] as String? ?? '';

    switch (action) {
      case 'fetchAndSave':
        await _handleFetchAndSave(request, cbId);
      case 'list':
        await _handleList(cbId);
      case 'read':
        await _handleRead(request, cbId);
      case 'delete':
        await _handleDelete(request, cbId);
    }
  }

  Future<void> _handleFetchAndSave(
      Map<String, dynamic> req, String cbId) async {
    final url = req['url'] as String? ?? '';
    final title = req['title'] as String? ?? '';
    if (url.isEmpty) {
      _respond(cbId, false, error: 'URL vide');
      return;
    }

    try {
      final response = await http
          .get(Uri.parse(url),
              headers: {'User-Agent': 'AhsecApp/1.0'})
          .timeout(const Duration(seconds: 25));

      if (response.statusCode != 200) {
        _respond(cbId, false, error: 'HTTP ${response.statusCode}');
        return;
      }

      final id =
          'local_${DateTime.now().millisecondsSinceEpoch.toRadixString(36)}';
      final article = ArchivedArticle(
        id: id,
        url: url,
        title: title.isNotEmpty ? title : url,
        html: response.body,
        createdAt: DateTime.now().toIso8601String(),
      );
      await _store.save(article);
      _respond(cbId, true, data: {
        'id': article.id,
        'url': article.url,
        'title': article.title,
        'createdAt': article.createdAt,
      });
    } catch (e) {
      _respond(cbId, false, error: e.toString());
    }
  }

  Future<void> _handleList(String cbId) async {
    final items = await _store.list();
    final list = items
        .map((a) => {
              'id': a.id,
              'url': a.url,
              'title': a.title,
              'createdAt': a.createdAt,
            })
        .toList(growable: false);
    _respond(cbId, true, data: list);
  }

  Future<void> _handleRead(Map<String, dynamic> req, String cbId) async {
    final url = req['url'] as String? ?? '';
    final id = req['id'] as String? ?? '';

    ArchivedArticle? article;
    if (url.isNotEmpty) {
      article = await _store.findByUrl(url);
    }
    if (article == null && id.isNotEmpty) {
      final items = await _store.list();
      article = items.where((a) => a.id == id).firstOrNull;
    }

    if (article == null) {
      _respond(cbId, false, error: 'Archive introuvable');
      return;
    }

    _respond(cbId, true, data: {
      'id': article.id,
      'url': article.url,
      'title': article.title,
      'html': article.html,
      'createdAt': article.createdAt,
    });
  }

  Future<void> _handleDelete(Map<String, dynamic> req, String cbId) async {
    final id = req['id'] as String? ?? '';
    if (id.isEmpty) {
      _respond(cbId, false, error: 'ID manquant');
      return;
    }
    await _store.delete(id);
    _respond(cbId, true);
  }

  void _respond(String callbackId, bool ok, {dynamic data, String? error}) {
    if (callbackId.isEmpty) return;
    final payload = jsonEncode({'ok': ok, 'data': data, 'error': error});
    final escaped = payload
        .replaceAll('\\', '\\\\')
        .replaceAll("'", "\\'")
        .replaceAll('\n', '\\n')
        .replaceAll('\r', '\\r');
    _controller
        .runJavaScript("window._ahsecBridgeResolve('$callbackId','$escaped');");
  }

  // ── Bridge injection ──────────────────────────────────────────────────────

  Future<void> _injectBridge() async {
    await _controller.runJavaScript(r'''
(function(){
  window._ahsecCallbacks = window._ahsecCallbacks || {};
  window._ahsecBridgeResolve = function(cbId, jsonStr) {
    try {
      var parsed = JSON.parse(jsonStr);
      var cb = window._ahsecCallbacks[cbId];
      if (cb) { delete window._ahsecCallbacks[cbId]; cb(parsed); }
    } catch(e) { console.error('bridge resolve error', e); }
  };

  window.ahsecBridge = function(action, params) {
    return new Promise(function(resolve) {
      var cbId = 'cb_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8);
      window._ahsecCallbacks[cbId] = resolve;
      var msg = JSON.stringify(Object.assign({action: action, callbackId: cbId}, params || {}));
      AhsecArchive.postMessage(msg);
      setTimeout(function(){ if(window._ahsecCallbacks[cbId]){delete window._ahsecCallbacks[cbId];resolve({ok:false,error:'timeout'});} }, 30000);
    });
  };

  window.archiveBackendAvailable = true;

  window.loadArchives = async function() {
    var res = await window.ahsecBridge('list');
    if (res.ok) {
      archiveItems = (res.data || []).map(function(item) {
        return { id: item.id, url: item.url, title: item.title, createdAt: item.createdAt, html: '' };
      });
    } else {
      archiveItems = loadLocalArchiveItems();
    }
    updateArchiveSelect();
    refreshArchiveButtons();
    archiveStatus(archiveItems.length + ' archive(s) sauvegardee(s).', false);
  };

  window.openArchiveById = async function(id) {
    if (!id) return;
    var res = await window.ahsecBridge('read', {id: id});
    if (res.ok && res.data) {
      var viewer = document.getElementById('archive-viewer');
      if (viewer) viewer.srcdoc = res.data.html || '<p>Archive vide</p>';
      archiveStatus('Lecture: ' + (res.data.title || id), false);
    } else {
      archiveStatus(res.error || 'Archive introuvable.', true);
    }
  };

  window.archiveArticle = async function(url, titleHint) {
    archiveStatus('Telechargement en cours...', false);
    var res = await window.ahsecBridge('fetchAndSave', {url: url, title: titleHint || ''});
    if (res.ok) {
      return { item: res.data };
    }
    throw new Error(res.error || 'Echec archivage');
  };

  window.deleteSelectedArchive = async function() {
    var select = document.getElementById('archive-select');
    if (!select || !select.value) return;
    await window.ahsecBridge('delete', {id: select.value});
    var viewer = document.getElementById('archive-viewer');
    if (viewer) viewer.srcdoc = '';
    await loadArchives();
    archiveStatus('Archive supprimee.', false);
  };

  var anchors = document.querySelectorAll('a[target="_blank"]');
  anchors.forEach(function(a){ a.setAttribute('target', '_self'); });
  window.open = function(url){ if(url) window.location.href = url; return null; };

  if (typeof loadArchives === 'function') loadArchives();
})();
''');
  }

  Future<void> _showHelp() async {
    if (!mounted) return;
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Aide'),
        content: const Text(
          'Mode autonome actif.\n\n'
          '\u2022 sec.html est embarque dans l\'APK\n'
          '\u2022 Clique "Archiver" pour telecharger un article\n'
          '\u2022 L\'article est sauvegarde localement sur ton tel\n'
          '\u2022 Clique "Lire local" pour le relire hors-ligne\n'
          '\u2022 Aucun serveur requis',
        ),
        actions: [
          FilledButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ahsec'),
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
    );
  }
}
