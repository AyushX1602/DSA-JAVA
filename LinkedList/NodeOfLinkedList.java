class Node {
    int data;
    Node next;
} 
public class NodeOfLinkedList {
    public static void main(String[] args) {
        Node a = new Node(); a.data = 10;
        Node b = new Node(); b.data = 20;
        Node c = new Node(); c.data = 30;
        a.next = b;
        b.next = c;
        System.out.println(a);
        System.out.println(b);
        System.out.println(a.data);
        System.out.println(a.next);
        System.out.println(a.next.data);
        System.out.println(b.next);
        System.out.println(b.next.data);
    }
}