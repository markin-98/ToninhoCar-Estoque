import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { mostrarAlerta } from '@/lib/alerta';
import CampoSenha from '@/components/CampoSenha';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase, supabaseCadastro } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTema, Cores } from '@/contexts/TemaContext';

const DOMINIO = '@toninho.com';

type Perfil = 'admin' | 'funcionario';

type MembroEquipe = {
  id: string;
  usuario: string;
  nome: string;
  email: string;
  perfil: Perfil;
  ativo: boolean;
  data_cadastro: string;
};

export default function EquipeScreen() {
  const { usuario: usuarioLogado } = useAuth();
  const { cores } = useTema();
  const router = useRouter();
  const s = useMemo(() => estilos(cores), [cores]);

  const [equipe, setEquipe] = useState<MembroEquipe[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [tabelaAusente, setTabelaAusente] = useState(false);

  // Formulário de cadastro
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState<Perfil>('funcionario');
  const [salvando, setSalvando] = useState(false);

  // Painel de gestão do membro selecionado (abre ao tocar no card)
  const [membroSel, setMembroSel] = useState<MembroEquipe | null>(null);
  const [redefinindo, setRedefinindo] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [processando, setProcessando] = useState(false);

  const carregar = useCallback(async () => {
    const { data, error } = await supabase.from('usuario').select('*').order('nome');
    if (error) {
      setTabelaAusente(true);
    } else {
      setTabelaAusente(false);
      setEquipe((data as MembroEquipe[]) ?? []);
    }
    setCarregandoLista(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function validar(): string | null {
    if (!nome.trim() || nome.trim().length < 2) return 'Informe o nome completo do mecânico.';
    const l = login.trim().toLowerCase();
    if (!l) return 'Informe o usuário de acesso.';
    if (!/^[a-z0-9._-]+$/.test(l)) return 'O usuário deve ter apenas letras minúsculas, números, ponto, hífen ou underline (sem espaços).';
    if (senha.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    if (equipe.some((m) => m.usuario === l)) return `Já existe um membro com o usuário "${l}".`;
    return null;
  }

  async function handleCadastrar() {
    const erro = validar();
    if (erro) {
      mostrarAlerta('Dados inválidos', erro);
      return;
    }

    setSalvando(true);
    const usuarioLimpo = login.trim().toLowerCase();
    const email = `${usuarioLimpo}${DOMINIO}`;

    const { data, error } = await supabaseCadastro.auth.signUp({
      email,
      password: senha,
      options: { data: { nome: nome.trim(), perfil } },
    });

    if (error || !data.user) {
      setSalvando(false);
      const msg = error?.message?.includes('already registered')
        ? 'Este usuário já está cadastrado.'
        : 'Não foi possível criar o acesso. Tente novamente.';
      mostrarAlerta('Erro', msg);
      return;
    }

    const { error: erroTabela } = await supabase.from('usuario').insert({
      id: data.user.id,
      usuario: usuarioLimpo,
      nome: nome.trim(),
      email,
      perfil,
    });

    setSalvando(false);

    if (erroTabela) {
      mostrarAlerta(
        'Atenção',
        'O login foi criado, mas não foi possível registrá-lo na lista da equipe. Verifique se a tabela "usuario" foi criada no Supabase.',
      );
    } else {
      mostrarAlerta('Sucesso', `Acesso criado!\n\nUsuário: ${usuarioLimpo}\nSenha: ${senha}\n\nAnote e repasse ao mecânico.`);
    }

    setNome('');
    setLogin('');
    setSenha('');
    setPerfil('funcionario');
    setMostrarForm(false);
    carregar();
  }

  function handleAlterarPerfil(membro: MembroEquipe) {
    const novoPerfil: Perfil = membro.perfil === 'admin' ? 'funcionario' : 'admin';
    if (membro.email === usuarioLogado?.email) {
      mostrarAlerta('Atenção', 'Você não pode alterar o seu próprio perfil.');
      return;
    }
    mostrarAlerta(
      'Alterar função',
      `Tornar ${membro.nome} ${novoPerfil === 'admin' ? 'Administrador' : 'Funcionário'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            await supabase.from('usuario').update({ perfil: novoPerfil }).eq('id', membro.id);
            carregar();
            fecharPainel();
          },
        },
      ],
    );
  }

  function handleAlternarAtivo(membro: MembroEquipe) {
    if (membro.email === usuarioLogado?.email) {
      mostrarAlerta('Atenção', 'Você não pode desativar o seu próprio acesso.');
      return;
    }
    mostrarAlerta(
      membro.ativo ? 'Desativar acesso' : 'Reativar acesso',
      membro.ativo
        ? `${membro.nome} não conseguirá mais entrar no app. Continuar?`
        : `${membro.nome} voltará a ter acesso ao app. Continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: membro.ativo ? 'destructive' : 'default',
          onPress: async () => {
            await supabase.from('usuario').update({ ativo: !membro.ativo }).eq('id', membro.id);
            carregar();
            fecharPainel();
          },
        },
      ],
    );
  }

  function fecharPainel() {
    setMembroSel(null);
    setRedefinindo(false);
    setNovaSenha('');
  }

  // Chama a Edge Function "admin-usuarios" (excluir / redefinir senha).
  async function chamarFuncaoAdmin(corpo: object): Promise<{ ok?: boolean; erro?: string } | null> {
    const { data, error } = await supabase.functions.invoke('admin-usuarios', { body: corpo });
    if (error) {
      mostrarAlerta(
        'Recurso indisponível',
        'A função "admin-usuarios" ainda não foi publicada no Supabase.\n\nSiga o guia src/bd/FUNCAO-ADMIN-USUARIOS.md (leva uns 5 minutos).',
      );
      return null;
    }
    return data as { ok?: boolean; erro?: string };
  }

  // Troca da PRÓPRIA senha (usuário logado). Não usa a Edge Function nem
  // precisa de permissão de admin: o Supabase permite que cada usuário
  // atualize a própria senha estando autenticado.
  async function handleTrocarMinhaSenha() {
    if (novaSenha.length < 6) {
      mostrarAlerta('Atenção', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setProcessando(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setProcessando(false);
    if (error) {
      mostrarAlerta('Erro', 'Não foi possível trocar a senha. Tente sair e entrar de novo antes de repetir.');
      return;
    }
    mostrarAlerta('Senha alterada', 'Sua senha foi atualizada com sucesso.');
    fecharPainel();
  }

  async function handleRedefinirSenha(membro: MembroEquipe) {
    if (novaSenha.length < 6) {
      mostrarAlerta('Atenção', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setProcessando(true);
    const resp = await chamarFuncaoAdmin({
      acao: 'redefinir_senha',
      id_usuario: membro.id,
      nova_senha: novaSenha,
    });
    setProcessando(false);
    if (!resp) return;
    if (resp.erro) {
      mostrarAlerta('Erro', resp.erro);
      return;
    }
    mostrarAlerta(
      'Senha redefinida',
      `Usuário: ${membro.usuario}\nNova senha: ${novaSenha}\n\nAnote e repasse ao mecânico.`,
    );
    fecharPainel();
  }

  function handleExcluirMembro(membro: MembroEquipe) {
    mostrarAlerta(
      'Excluir usuário',
      `Excluir ${membro.nome} DEFINITIVAMENTE? O acesso será apagado e não poderá ser recuperado. (Para bloquear temporariamente, prefira "Desativar acesso".)`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setProcessando(true);
            const resp = await chamarFuncaoAdmin({ acao: 'excluir', id_usuario: membro.id });
            setProcessando(false);
            if (!resp) return;
            if (resp.erro) {
              mostrarAlerta('Erro', resp.erro);
              return;
            }
            fecharPainel();
            carregar();
          },
        },
      ],
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={s.container} contentContainerStyle={s.conteudo} keyboardShouldPersistTaps="handled">
        {/* Cabeçalho */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.botaoVoltar} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={cores.texto} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.titulo}>Equipe</Text>
            <Text style={s.subtitulo}>Gerencie quem tem acesso ao app</Text>
          </View>
          <TouchableOpacity
            style={s.botaoNovo}
            onPress={() => setMostrarForm(!mostrarForm)}
            activeOpacity={0.8}
          >
            <Ionicons name={mostrarForm ? 'close' : 'person-add'} size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Aviso: tabela ainda não criada no Supabase */}
        {tabelaAusente && (
          <View style={s.avisoCard}>
            <Ionicons name="warning-outline" size={18} color="#92400E" />
            <Text style={s.avisoTexto}>
              A tabela &quot;usuario&quot; ainda não foi criada no Supabase. Rode o script
              src/bd/CRIAR-TABELA-USUARIO.sql no SQL Editor do painel para habilitar esta tela.
            </Text>
          </View>
        )}

        {/* Formulário de cadastro */}
        {mostrarForm && (
          <View style={s.formCard}>
            <Text style={s.formTitulo}>Novo membro da equipe</Text>

            <Text style={s.label}>Nome completo *</Text>
            <TextInput
              style={s.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Ex: João da Silva"
              placeholderTextColor={cores.textoTerc}
              editable={!salvando}
            />

            <Text style={s.label}>Usuário de acesso *</Text>
            <View style={s.inputUsuarioLinha}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                value={login}
                onChangeText={(t) => setLogin(t.toLowerCase().replace(/\s/g, ''))}
                placeholder="ex: joao"
                placeholderTextColor={cores.textoTerc}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!salvando}
              />
              <Text style={s.dominio}>{DOMINIO}</Text>
            </View>

            <Text style={s.label}>Senha *</Text>
            <CampoSenha
              boxStyle={s.input}
              value={senha}
              onChangeText={setSenha}
              placeholder="Mínimo 6 caracteres"
              editable={!salvando}
            />

            <Text style={s.label}>Função *</Text>
            <View style={s.perfilLinha}>
              <TouchableOpacity
                style={[s.perfilOpcao, perfil === 'funcionario' && s.perfilOpcaoAtiva]}
                onPress={() => setPerfil('funcionario')}
                activeOpacity={0.8}
              >
                <Ionicons name="construct-outline" size={16} color={perfil === 'funcionario' ? cores.primaria : cores.textoSec} />
                <Text style={[s.perfilTexto, perfil === 'funcionario' && s.perfilTextoAtivo]}>Funcionário</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.perfilOpcao, perfil === 'admin' && s.perfilOpcaoAtiva]}
                onPress={() => setPerfil('admin')}
                activeOpacity={0.8}
              >
                <Ionicons name="shield-checkmark-outline" size={16} color={perfil === 'admin' ? cores.primaria : cores.textoSec} />
                <Text style={[s.perfilTexto, perfil === 'admin' && s.perfilTextoAtivo]}>Administrador</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[s.botaoSalvar, salvando && { opacity: 0.6 }]}
              onPress={handleCadastrar}
              disabled={salvando}
              activeOpacity={0.85}
            >
              <Text style={s.botaoSalvarTexto}>{salvando ? 'Criando acesso...' : 'Criar Acesso'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista da equipe */}
        <Text style={s.secaoTitulo}>
          Membros ({equipe.length})
        </Text>

        {carregandoLista ? (
          <Text style={s.vazio}>Carregando...</Text>
        ) : equipe.length === 0 && !tabelaAusente ? (
          <Text style={s.vazio}>Nenhum membro cadastrado ainda.</Text>
        ) : (
          equipe.map((membro) => {
            const souEu = membro.email === usuarioLogado?.email;
            return (
              <TouchableOpacity
                key={membro.id}
                style={[s.membroCard, !membro.ativo && s.membroInativo]}
                activeOpacity={0.7}
                onPress={() => { setMembroSel(membro); setRedefinindo(false); setNovaSenha(''); }}
              >
                <View style={[s.membroAvatar, { backgroundColor: membro.perfil === 'admin' ? '#DBEAFE' : cores.inputFundo }]}>
                  <Ionicons
                    name={membro.perfil === 'admin' ? 'shield-checkmark' : 'construct'}
                    size={18}
                    color={membro.perfil === 'admin' ? '#2563EB' : cores.textoSec}
                  />
                </View>

                <View style={s.membroInfo}>
                  <Text style={s.membroNome}>
                    {membro.nome} {souEu ? '(você)' : ''}
                  </Text>
                  <Text style={s.membroLogin}>{membro.usuario}{DOMINIO}</Text>
                  <View style={s.membroBadges}>
                    <View style={[s.badge, { backgroundColor: membro.perfil === 'admin' ? '#DBEAFE' : cores.inputFundo }]}>
                      <Text style={[s.badgeTexto, { color: membro.perfil === 'admin' ? '#2563EB' : cores.textoSec }]}>
                        {membro.perfil === 'admin' ? 'Administrador' : 'Funcionário'}
                      </Text>
                    </View>
                    {!membro.ativo && (
                      <View style={[s.badge, { backgroundColor: '#FEE2E2' }]}>
                        <Text style={[s.badgeTexto, { color: '#EF4444' }]}>Desativado</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color={cores.textoTerc} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Painel de gestão do membro (abre ao tocar no card) */}
      <Modal
        visible={!!membroSel}
        transparent
        animationType="slide"
        onRequestClose={fecharPainel}
      >
        <View style={s.modalFundo}>
          <View style={s.modalCard}>
            {membroSel && (() => {
              const souEu = membroSel.email === usuarioLogado?.email;
              return (
                <>
                  <View style={s.modalHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.modalNome}>{membroSel.nome}{souEu ? ' (você)' : ''}</Text>
                      <Text style={s.modalLogin}>{membroSel.usuario}{DOMINIO}</Text>
                    </View>
                    <TouchableOpacity onPress={fecharPainel} style={s.modalFechar} activeOpacity={0.7}>
                      <Ionicons name="close" size={22} color={cores.textoSec} />
                    </TouchableOpacity>
                  </View>

                  {redefinindo ? (
                    <View>
                      <Text style={s.label}>Nova senha</Text>
                      <CampoSenha
                        boxStyle={s.input}
                        value={novaSenha}
                        onChangeText={setNovaSenha}
                        placeholder="Mínimo 6 caracteres"
                        editable={!processando}
                        autoFocus
                      />
                      <View style={s.modalBotoesLinha}>
                        <TouchableOpacity style={s.modalBtnSecundario} onPress={() => { setRedefinindo(false); setNovaSenha(''); }} activeOpacity={0.8}>
                          <Text style={s.modalBtnSecundarioTexto}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[s.modalBtnPrimario, processando && { opacity: 0.6 }]}
                          onPress={() => (souEu ? handleTrocarMinhaSenha() : handleRedefinirSenha(membroSel))}
                          disabled={processando}
                          activeOpacity={0.85}
                        >
                          <Text style={s.modalBtnPrimarioTexto}>{processando ? 'Salvando...' : 'Salvar senha'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : souEu ? (
                    <View style={{ gap: 10 }}>
                      <AcaoLinha
                        s={s}
                        cores={cores}
                        icone="key-outline"
                        cor="#7C3AED"
                        titulo="Trocar minha senha"
                        onPress={() => setRedefinindo(true)}
                        desabilitado={processando}
                      />
                    </View>
                  ) : (
                    <View style={{ gap: 10 }}>
                      <AcaoLinha
                        s={s}
                        cores={cores}
                        icone="swap-vertical"
                        cor={cores.primaria}
                        titulo={membroSel.perfil === 'admin' ? 'Tornar Funcionário' : 'Tornar Administrador'}
                        onPress={() => handleAlterarPerfil(membroSel)}
                        desabilitado={processando}
                      />
                      <AcaoLinha
                        s={s}
                        cores={cores}
                        icone="key-outline"
                        cor="#7C3AED"
                        titulo="Redefinir senha"
                        onPress={() => setRedefinindo(true)}
                        desabilitado={processando}
                      />
                      <AcaoLinha
                        s={s}
                        cores={cores}
                        icone={membroSel.ativo ? 'lock-closed-outline' : 'lock-open-outline'}
                        cor={membroSel.ativo ? '#D97706' : '#10B981'}
                        titulo={membroSel.ativo ? 'Desativar acesso' : 'Reativar acesso'}
                        onPress={() => handleAlternarAtivo(membroSel)}
                        desabilitado={processando}
                      />
                      <AcaoLinha
                        s={s}
                        cores={cores}
                        icone="trash-outline"
                        cor="#EF4444"
                        titulo="Excluir usuário"
                        onPress={() => handleExcluirMembro(membroSel)}
                        desabilitado={processando}
                      />
                    </View>
                  )}
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function AcaoLinha({
  s,
  cores,
  icone,
  cor,
  titulo,
  onPress,
  desabilitado,
}: {
  s: ReturnType<typeof estilos>;
  cores: Cores;
  icone: React.ComponentProps<typeof Ionicons>['name'];
  cor: string;
  titulo: string;
  onPress: () => void;
  desabilitado?: boolean;
}) {
  return (
    <TouchableOpacity style={s.acaoLinha} onPress={onPress} disabled={desabilitado} activeOpacity={0.7}>
      <View style={[s.acaoLinhaIcone, { backgroundColor: cor + '22' }]}>
        <Ionicons name={icone} size={18} color={cor} />
      </View>
      <Text style={[s.acaoLinhaTexto, { color: cor }]}>{titulo}</Text>
      <Ionicons name="chevron-forward" size={16} color={cores.textoTerc} />
    </TouchableOpacity>
  );
}

const estilos = (c: Cores) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.fundo },
  conteudo: { padding: 20, paddingTop: 60, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  botaoVoltar: { padding: 8, borderRadius: 8, backgroundColor: c.inputFundo },
  titulo: { fontSize: 22, fontWeight: 'bold', color: c.texto },
  subtitulo: { fontSize: 13, color: c.textoSec, marginTop: 2 },
  botaoNovo: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: c.primaria,
    justifyContent: 'center', alignItems: 'center',
  },

  avisoCard: {
    flexDirection: 'row', gap: 8, backgroundColor: '#FEF3C7',
    borderRadius: 12, padding: 14, marginBottom: 16, alignItems: 'flex-start',
  },
  avisoTexto: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },

  formCard: {
    backgroundColor: c.card, borderRadius: 16, padding: 18, marginBottom: 20,
    borderWidth: 1, borderColor: c.cardBorda,
  },
  formTitulo: { fontSize: 16, fontWeight: '700', color: c.texto, marginBottom: 4 },
  label: { fontSize: 13, fontWeight: '600', color: c.texto, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: c.inputFundo, borderWidth: 1, borderColor: c.cardBorda,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: c.texto,
  },
  inputUsuarioLinha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dominio: { fontSize: 14, color: c.textoSec, fontWeight: '600' },

  perfilLinha: { flexDirection: 'row', gap: 10 },
  perfilOpcao: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: c.cardBorda, borderRadius: 10, paddingVertical: 11,
    backgroundColor: c.inputFundo,
  },
  perfilOpcaoAtiva: { borderColor: c.primaria, backgroundColor: c.primariaSuave },
  perfilTexto: { fontSize: 13, fontWeight: '600', color: c.textoSec },
  perfilTextoAtivo: { color: c.primaria },

  botaoSalvar: {
    backgroundColor: c.primaria, borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginTop: 18,
  },
  botaoSalvarTexto: { color: '#fff', fontSize: 15, fontWeight: '700' },

  secaoTitulo: { fontSize: 16, fontWeight: '700', color: c.texto, marginBottom: 12 },
  vazio: { fontSize: 14, color: c.textoTerc, textAlign: 'center', marginTop: 20 },

  membroCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.card, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: c.cardBorda,
  },
  membroInativo: { opacity: 0.6 },
  membroAvatar: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  membroInfo: { flex: 1 },
  membroNome: { fontSize: 15, fontWeight: '700', color: c.texto },
  membroLogin: { fontSize: 12, color: c.textoSec, marginTop: 1 },
  membroBadges: { flexDirection: 'row', gap: 6, marginTop: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeTexto: { fontSize: 10, fontWeight: '700' },

  // Modal de gestão do membro
  modalFundo: { flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: c.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 22, paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
  modalNome: { fontSize: 18, fontWeight: '700', color: c.texto },
  modalLogin: { fontSize: 13, color: c.textoSec, marginTop: 2 },
  modalFechar: { padding: 6, borderRadius: 8, backgroundColor: c.inputFundo },
  modalAviso: { fontSize: 14, color: c.textoTerc, textAlign: 'center', paddingVertical: 16 },
  modalBotoesLinha: { flexDirection: 'row', gap: 10, marginTop: 18 },
  modalBtnSecundario: {
    flex: 1, borderWidth: 1.5, borderColor: c.cardBorda, borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  modalBtnSecundarioTexto: { fontSize: 15, fontWeight: '600', color: c.textoSec },
  modalBtnPrimario: {
    flex: 1, backgroundColor: c.primaria, borderRadius: 10, paddingVertical: 13, alignItems: 'center',
  },
  modalBtnPrimarioTexto: { fontSize: 15, fontWeight: '700', color: '#fff' },

  acaoLinha: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: c.inputFundo, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: c.divisor,
  },
  acaoLinhaIcone: {
    width: 38, height: 38, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  acaoLinhaTexto: { flex: 1, fontSize: 15, fontWeight: '600' },
});
